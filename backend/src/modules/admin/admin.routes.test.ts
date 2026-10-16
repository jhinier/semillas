import { afterEach, describe, expect, it } from "bun:test";
import { Hono } from "hono";
import app from "../../app";
import type { AppBindings } from "../../config/env";
import { crearModuloAdmin } from "./admin.routes";
import { UnprocessableEntityError } from "../../shared/errors/http-error";
import { errorHandler } from "../../shared/middleware/error-handler";

const env: AppBindings["Bindings"] = {
  APP_ENV: "development",
  CORS_BASE_DOMAIN: "localhost",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "test-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  SUPABASE_PROJECT_REF: "test-project-ref"
};

const TOKEN_INVITADO = "guest-token-test-1234567890";
const TOKEN_INVITADO_HASH = "c9c27b711102ce6c9dd22f9b6b6b08bec1c294ce4b2a636e31c5a85c6f6ee6b2";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function responderSupabase(casos: Array<{ metodo: string; path: string; responder: (request: Request) => Promise<Response> | Response }>) {
  const pendientes = [...casos];

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = input instanceof Request ? input : new Request(String(input), init);
    const url = new URL(request.url);
    const index = pendientes.findIndex((item) => item.metodo === request.method && url.pathname === item.path);
    const caso = index >= 0 ? pendientes.splice(index, 1)[0] : null;

    if (caso) {
      return caso.responder(request);
    }

    return new Response(JSON.stringify({ error: `Ruta no mockeada: ${request.method} ${url.pathname}` }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }) as typeof fetch;
}

describe("admin.routes", () => {
  it("bloquea el bypass directo de publicación con errores estructurados", async () => {
    responderSupabase([
      {
        metodo: "GET",
        path: "/rest/v1/usuario_app",
        responder: () => new Response(JSON.stringify({
          id: "usuario-admin",
          rol: "administrador",
          proveedor: "invitado",
          nombre_visible: "Admin",
          correo: null,
          activo: true,
          token_invitado_hash: TOKEN_INVITADO_HASH,
        }), { headers: { "content-type": "application/json" } }),
      },
    ]);

    const appAdmin = new Hono<AppBindings>();
    appAdmin.onError(errorHandler);
    appAdmin.route("/administracion", crearModuloAdmin(() => ({
      publicarTema: async () => {
        throw new UnprocessableEntityError("El tema todavía no está completo", {
          errores: [{ codigo: "MATRIZ_INCOMPLETA", ruta: "crecer.semillas.conectar", mensaje: "Falta contenido" }],
        });
      },
    }) as unknown as ReturnType<typeof import("./admin.repository").crearAdminRepository>));

    const response = await appAdmin.fetch(new Request("http://localhost/administracion/temas/tema-1/publicar", {
      method: "POST",
      headers: { "x-guest-user-id": "usuario-admin", "x-guest-token": TOKEN_INVITADO },
    }), env);
    const body = await response.json() as { exito: false; codigo: string; detalle: { errores: Array<{ codigo: string }> } };

    expect(response.status).toBe(422);
    expect(body.exito).toBe(false);
    expect(body.codigo).toBe("UNPROCESSABLE_ENTITY");
    expect(body.detalle.errores[0]?.codigo).toBe("MATRIZ_INCOMPLETA");
  });

  it("archiva un tema existente y conserva su identidad", async () => {
    let cuerpoActualizacion: Record<string, unknown> | null = null;

    responderSupabase([
      {
        metodo: "GET",
        path: "/rest/v1/usuario_app",
        responder: () =>
          new Response(
            JSON.stringify({
              id: "usuario-admin",
              rol: "administrador",
              proveedor: "invitado",
              nombre_visible: "Admin",
              correo: null,
              activo: true,
              token_invitado_hash: TOKEN_INVITADO_HASH
            }),
            { status: 200, headers: { "content-type": "application/json" } }
          )
      },
      {
        metodo: "GET",
        path: "/rest/v1/tema",
        responder: () =>
          new Response(
            JSON.stringify({
              id: "tema-1",
              senda_id: "senda-1",
              titulo: "La creación",
              slug: "la-creacion",
              objetivo: "Aprender sobre la creación",
              resumen: "Dios creó todo",
              portada_recurso_id: null,
              estado: "archivado",
              version_biblica_id: "biblia-1",
              xp_recompensa: 100,
              minutos_estimados: 10,
              version_contenido: 3,
              publicado_en: "2026-01-01T00:00:00.000Z",
              creado_en: "2026-01-01T00:00:00.000Z",
              actualizado_en: "2026-01-02T00:00:00.000Z",
              creado_por: "usuario-admin",
              path: { id: "senda-1", codigo: "padre", nombre: "Padre", color_hex: "#3D8BD4" },
              created_by: { id: "usuario-admin", nombre_visible: "Admin" },
              portada_recurso: null,
              grupos_edad: []
            }),
            { status: 200, headers: { "content-type": "application/json" } }
          )
      },
      {
        metodo: "PATCH",
        path: "/rest/v1/tema",
        responder: async (request) => {
          cuerpoActualizacion = JSON.parse(await request.clone().text()) as Record<string, unknown>;

          return new Response(JSON.stringify({}), {
            status: 200,
            headers: { "content-type": "application/json" }
          });
        }
      }
    ]);

    const response = await app.fetch(
      new Request("http://localhost/administracion/temas/tema-1/archivar", {
        method: "POST",
        headers: {
          "x-guest-user-id": "usuario-admin",
          "x-guest-token": TOKEN_INVITADO
        }
      }),
      env
    );

    const body = (await response.json()) as {
      exito: true;
      datos: { estado: string; id: string };
    };

    expect(response.status).toBe(200);
    expect(body.datos.id).toBe("tema-1");
    expect(body.datos.estado).toBe("archivado");
    expect(cuerpoActualizacion).toMatchObject({ estado: "archivado" });
  });

  it("duplica un tema como borrador con slug nuevo y franjas copiadas", async () => {
    const inserciones: Array<{ path: string; body: Record<string, unknown> }> = [];

    responderSupabase([
      {
        metodo: "GET",
        path: "/rest/v1/usuario_app",
        responder: () =>
          new Response(
            JSON.stringify({
              id: "usuario-admin",
              rol: "administrador",
              proveedor: "invitado",
              nombre_visible: "Admin",
              correo: null,
              activo: true,
              token_invitado_hash: TOKEN_INVITADO_HASH
            }),
            { status: 200, headers: { "content-type": "application/json" } }
          )
      },
      {
        metodo: "GET",
        path: "/rest/v1/tema",
        responder: () =>
          new Response(
            JSON.stringify({
              id: "tema-1",
              senda_id: "senda-1",
              titulo: "La creación",
              slug: "la-creacion",
              objetivo: "Aprender sobre la creación",
              resumen: "Dios creó todo",
              portada_recurso_id: "portada-1",
              estado: "publicado",
              version_biblica_id: "biblia-1",
              xp_recompensa: 100,
              minutos_estimados: 10,
              version_contenido: 3,
              publicado_en: "2026-01-01T00:00:00.000Z",
              creado_en: "2026-01-01T00:00:00.000Z",
              actualizado_en: "2026-01-02T00:00:00.000Z",
              creado_por: "usuario-admin",
              path: { id: "senda-1", codigo: "padre", nombre: "Padre", color_hex: "#3D8BD4" },
              created_by: { id: "usuario-admin", nombre_visible: "Admin" },
              portada_recurso: { id: "portada-1", url_publica: "https://cdn.test/portada.png", texto_alternativo: "Portada", titulo: "Portada" },
              grupos_edad: [
                { id: "grupo-1", codigo: "semillas", nombre: "Semillas" },
                { id: "grupo-2", codigo: "exploradores", nombre: "Exploradores" }
              ]
            }),
            { status: 200, headers: { "content-type": "application/json" } }
          )
      },
      {
        metodo: "GET",
        path: "/rest/v1/paso_tema",
        responder: () =>
          new Response(JSON.stringify([]), {
            status: 200,
            headers: { "content-type": "application/json" }
          })
      },
      {
        metodo: "GET",
        path: "/rest/v1/actividad",
        responder: () =>
          new Response(JSON.stringify([]), {
            status: 200,
            headers: { "content-type": "application/json" }
          })
      },
      {
        metodo: "POST",
        path: "/rest/v1/tema",
        responder: async (request) => {
          inserciones.push({ path: "/rest/v1/tema", body: JSON.parse(await request.clone().text()) as Record<string, unknown> });

          return new Response(
            JSON.stringify({
              id: "tema-duplicado",
              senda_id: "senda-1",
              titulo: "La creación (copia)",
              slug: "la-creacion-copia-12345678",
              objetivo: "Aprender sobre la creación",
              resumen: "Dios creó todo",
              portada_recurso_id: "portada-1",
              estado: "borrador",
              version_biblica_id: "biblia-1",
              xp_recompensa: 100,
              minutos_estimados: 10,
              version_contenido: 0,
              publicado_en: null,
              creado_en: "2026-01-03T00:00:00.000Z",
              actualizado_en: "2026-01-03T00:00:00.000Z",
              creado_por: "usuario-admin",
              path: { id: "senda-1", codigo: "padre", nombre: "Padre", color_hex: "#3D8BD4" },
              created_by: { id: "usuario-admin", nombre_visible: "Admin" },
              portada_recurso: { id: "portada-1", url_publica: "https://cdn.test/portada.png", texto_alternativo: "Portada", titulo: "Portada" },
              grupos_edad: [
                { id: "grupo-1", codigo: "semillas", nombre: "Semillas" },
                { id: "grupo-2", codigo: "exploradores", nombre: "Exploradores" }
              ]
            }),
            { status: 201, headers: { "content-type": "application/json" } }
          );
        }
      },
      {
        metodo: "POST",
        path: "/rest/v1/tema_grupo_edad",
        responder: async (request) => {
          inserciones.push({ path: "/rest/v1/tema_grupo_edad", body: JSON.parse(await request.clone().text()) as Record<string, unknown> });

          return new Response(JSON.stringify([{ tema_id: "tema-duplicado", grupo_edad_id: "grupo-1" }]), {
            status: 201,
            headers: { "content-type": "application/json" }
          });
        }
      },
      {
        metodo: "POST",
        path: "/rest/v1/registro_auditoria",
        responder: () =>
          new Response(JSON.stringify({}), {
            status: 201,
            headers: { "content-type": "application/json" }
          })
      },
      {
        metodo: "GET",
        path: "/rest/v1/tema",
        responder: () =>
          new Response(
            JSON.stringify({
              id: "tema-duplicado",
              senda_id: "senda-1",
              titulo: "La creación (copia)",
              slug: "la-creacion-copia-12345678",
              objetivo: "Aprender sobre la creación",
              resumen: "Dios creó todo",
              portada_recurso_id: "portada-1",
              estado: "borrador",
              version_biblica_id: "biblia-1",
              xp_recompensa: 100,
              minutos_estimados: 10,
              version_contenido: 0,
              publicado_en: null,
              creado_en: "2026-01-03T00:00:00.000Z",
              actualizado_en: "2026-01-03T00:00:00.000Z",
              creado_por: "usuario-admin",
              path: { id: "senda-1", codigo: "padre", nombre: "Padre", color_hex: "#3D8BD4" },
              created_by: { id: "usuario-admin", nombre_visible: "Admin" },
              portada_recurso: { id: "portada-1", url_publica: "https://cdn.test/portada.png", texto_alternativo: "Portada", titulo: "Portada" },
              grupos_edad: [
                { grupo_edad: { id: "grupo-1", codigo: "semillas", nombre: "Semillas" } },
                { grupo_edad: { id: "grupo-2", codigo: "exploradores", nombre: "Exploradores" } }
              ]
            }),
            { status: 200, headers: { "content-type": "application/json" } }
          )
      }
    ]);

    const response = await app.fetch(
      new Request("http://localhost/administracion/temas/tema-1/duplicar", {
        method: "POST",
        headers: {
          "x-guest-user-id": "usuario-admin",
          "x-guest-token": TOKEN_INVITADO
        }
      }),
      env
    );

    const body = (await response.json()) as {
      exito: true;
      datos: { id: string; slug: string; estado: string; grupos_edad: Array<{ id: string }> };
    };

    expect(response.status).toBe(201);
    expect(body.datos.id).toBe("tema-duplicado");
    expect(body.datos.estado).toBe("borrador");
    expect(body.datos.slug).toContain("la-creacion-copia-");
    expect(body.datos.grupos_edad).toHaveLength(2);
    expect(inserciones[0].path).toBe("/rest/v1/tema");
    expect(inserciones[0].body).toMatchObject({
      titulo: "La creación (copia)",
      estado: "borrador",
      version_contenido: 0,
      senda_id: "senda-1",
      portada_recurso_id: "portada-1"
    });
    expect(inserciones[1].path).toBe("/rest/v1/tema_grupo_edad");
    expect(inserciones[1].body as unknown as Array<{ tema_id: string; grupo_edad_id: string }>).toEqual([
      { tema_id: "tema-duplicado", grupo_edad_id: "grupo-1" },
      { tema_id: "tema-duplicado", grupo_edad_id: "grupo-2" }
    ]);
  });

  it("rechaza una imagen de recurso inválida al crear una senda", async () => {
    responderSupabase([
      {
        metodo: "GET",
        path: "/rest/v1/usuario_app",
        responder: () => new Response(JSON.stringify({
          id: "usuario-admin",
          rol: "administrador",
          proveedor: "invitado",
          nombre_visible: "Admin",
          correo: null,
          activo: true,
          token_invitado_hash: TOKEN_INVITADO_HASH
        }), { headers: { "content-type": "application/json" } })
      }
    ]);

    const response = await app.fetch(new Request("http://localhost/administracion/sendas", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-guest-user-id": "usuario-admin",
        "x-guest-token": TOKEN_INVITADO
      },
      body: JSON.stringify({
        codigo: "padre",
        nombre: "Senda del Padre",
        color_hex: "#3D8BD4",
        orden: 1,
        imagen_recurso_id: "no-es-uuid"
      })
    }), env);

    expect(response.status).toBe(400);
  });

  it("actualiza y devuelve imagen_recurso_id al editar una senda", async () => {
    const imagenRecursoId = "550e8400-e29b-41d4-a716-446655440099";
    let actualizacion: { sendaId: string; cuerpo: Record<string, unknown> } | null = null;

    responderSupabase([
      {
        metodo: "GET",
        path: "/rest/v1/usuario_app",
        responder: () => new Response(JSON.stringify({
          id: "usuario-admin",
          rol: "administrador",
          proveedor: "invitado",
          nombre_visible: "Admin",
          correo: null,
          activo: true,
          token_invitado_hash: TOKEN_INVITADO_HASH
        }), { headers: { "content-type": "application/json" } })
      }
    ]);

    const appAdmin = new Hono<AppBindings>();
    appAdmin.route("/administracion", crearModuloAdmin(() => ({
      actualizarSenda: async (sendaId, cuerpo) => {
        actualizacion = { sendaId, cuerpo };
        return {
          id: sendaId,
          codigo: "padre",
          nombre: "Senda del Padre",
          descripcion: null,
          colorHex: "#3D8BD4",
          nombreIcono: null,
          imagenRecursoId,
          orden: 1,
          activo: true,
          creadoEn: new Date("2026-07-12T00:00:00.000Z")
        };
      }
    }) as ReturnType<typeof import("./admin.repository").crearAdminRepository>));

    const response = await appAdmin.fetch(new Request("http://localhost/administracion/sendas/senda-1", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "x-guest-user-id": "usuario-admin",
        "x-guest-token": TOKEN_INVITADO
      },
      body: JSON.stringify({
        codigo: "padre",
        nombre: "Senda del Padre",
        color_hex: "#3D8BD4",
        imagen_recurso_id: imagenRecursoId
      })
    }), env);

    const body = await response.json() as { exito: true; datos: { imagen_recurso_id: string | null } };

    const actualizacionCapturada = (): { sendaId: string; cuerpo: Record<string, unknown> } | null => actualizacion;

    expect(response.status).toBe(200);
    expect(actualizacionCapturada()).toMatchObject({
      sendaId: "senda-1",
      cuerpo: { imagen_recurso_id: imagenRecursoId }
    });
    expect(body.datos.imagen_recurso_id).toBe(imagenRecursoId);
  });

  it("obtiene y persiste los ajustes administrativos", async () => {
    let patchBody: Record<string, unknown> | null = null;

    responderSupabase([
      {
        metodo: "GET",
        path: "/rest/v1/usuario_app",
        responder: () =>
          new Response(JSON.stringify({
            id: "usuario-admin",
            rol: "administrador",
            proveedor: "invitado",
            nombre_visible: "Admin",
            correo: null,
            activo: true,
            token_invitado_hash: TOKEN_INVITADO_HASH
          }), { headers: { "content-type": "application/json" } })
      },
      {
        metodo: "GET",
        path: "/rest/v1/usuario_app",
        responder: () =>
          new Response(JSON.stringify({
            id: "usuario-admin",
            rol: "administrador",
            proveedor: "invitado",
            nombre_visible: "Admin",
            correo: null,
            activo: true,
            token_invitado_hash: TOKEN_INVITADO_HASH
          }), { headers: { "content-type": "application/json" } })
      },
      {
        metodo: "GET",
        path: "/rest/v1/configuracion_plataforma",
        responder: () =>
          new Response(JSON.stringify(ajustesConfiguracion()), { headers: { "content-type": "application/json" } })
      },
      {
        metodo: "GET",
        path: "/rest/v1/configuracion_plataforma",
        responder: () =>
          new Response(JSON.stringify(ajustesConfiguracion()), { headers: { "content-type": "application/json" } })
      },
      {
        metodo: "POST",
        path: "/rest/v1/configuracion_plataforma",
        responder: async (request) => {
          patchBody = JSON.parse(await request.clone().text()) as Record<string, unknown>;
          return new Response(JSON.stringify(ajustesConfiguracion()), { headers: { "content-type": "application/json" } });
        }
      },
      {
        metodo: "GET",
        path: "/rest/v1/configuracion_plataforma",
        responder: () =>
          new Response(JSON.stringify(ajustesConfiguracion()), { headers: { "content-type": "application/json" } })
      },
      {
        metodo: "POST",
        path: "/rest/v1/registro_auditoria",
        responder: () => new Response(JSON.stringify({ id: "auditoria-1" }), { headers: { "content-type": "application/json" } })
      }
    ]);

    const responseGet = await app.fetch(
      new Request("http://localhost/administracion/ajustes", {
        headers: {
          "x-guest-user-id": "usuario-admin",
          "x-guest-token": TOKEN_INVITADO
        }
      }),
      env
    );

    expect(responseGet.status).toBe(200);
    const bodyGet = (await responseGet.json()) as {
      exito: boolean;
      datos: { nombre_plataforma: string; correo_soporte: string | null };
    };
    expect(bodyGet.datos.nombre_plataforma).toBe("Semillas");

    const responsePatch = await app.fetch(
      new Request("http://localhost/administracion/ajustes", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-guest-user-id": "usuario-admin",
          "x-guest-token": TOKEN_INVITADO
        },
        body: JSON.stringify({
          correo_soporte: "ayuda@semillas.org",
          notas_obligatorias_cambios: false
        })
      }),
      env
    );

    expect(responsePatch.status).toBe(200);
    expect(patchBody).toMatchObject({
      0: { clave: "administracion.nombre_plataforma", valor: "Semillas" },
      1: { clave: "administracion.correo_soporte", valor: "ayuda@semillas.org" },
      3: { clave: "administracion.notas_obligatorias_cambios", valor: false }
    });
  });
});

function ajustesConfiguracion() {
  const actualizado_en = "2026-07-13T00:00:00.000Z";
  return [
    { clave: "administracion.nombre_plataforma", valor: "Semillas", actualizado_en },
    { clave: "administracion.correo_soporte", valor: "soporte@semillas.org", actualizado_en },
    { clave: "administracion.zona_horaria", valor: "America/Guayaquil", actualizado_en },
    { clave: "administracion.notas_obligatorias_cambios", valor: true, actualizado_en },
    { clave: "administracion.notas_obligatorias_rechazo", valor: true, actualizado_en }
  ];
}
