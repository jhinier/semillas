import { afterEach, describe, expect, it } from "bun:test";
import { Hono } from "hono";
import type { AppBindings } from "../../config/env";
import { errorHandler } from "../../shared/middleware/error-handler";
import { crearModuloAdminClubs } from "./admin-clubs.routes";

const env: AppBindings["Bindings"] = {
  APP_ENV: "development",
  CORS_BASE_DOMAIN: "localhost",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "test-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
};

const TOKEN_INVITADO = "guest-token-test-1234567890";
const TOKEN_INVITADO_HASH = "c9c27b711102ce6c9dd22f9b6b6b08bec1c294ce4b2a636e31c5a85c6f6ee6b2";
const fetchOriginal = globalThis.fetch;
const CLUB_ID = "00000000-0000-4000-8000-000000000001";
const USUARIO_ID = "00000000-0000-4000-8000-000000000002";

const cabecerasAdmin = {
  "x-guest-user-id": "admin-1",
  "x-guest-token": TOKEN_INVITADO,
};

const cabecerasUsuario = {
  "x-guest-user-id": "usuario-1",
  "x-guest-token": TOKEN_INVITADO,
};

type CasoAdminClubs = {
  listar: (filtros: { q?: string; activo?: boolean; orden?: "recientes" | "nombre" | "miembros"; limit: number; offset: number }) => Promise<unknown>;
  quitarMiembro: (clubId: string, usuarioId: string, administradorId: string) => Promise<unknown>;
  crear?: (...argumentos: unknown[]) => Promise<unknown>;
  actualizar?: (...argumentos: unknown[]) => Promise<unknown>;
  agregarMiembro?: (...argumentos: unknown[]) => Promise<unknown>;
  regenerarCodigo?: (...argumentos: unknown[]) => Promise<unknown>;
  crearReto?: () => Promise<unknown>;
  archivar?: () => Promise<unknown>;
  reactivar?: () => Promise<unknown>;
  transferirLiderazgo?: () => Promise<unknown>;
  cerrarReto?: () => Promise<unknown>;
};

function crearApp(
  casos: CasoAdminClubs,
  registrarAuditoria: (registro: Record<string, unknown>) => Promise<void>,
) {
  const app = new Hono<AppBindings>();
  app.onError(errorHandler);
  app.route("/administracion/clubes", crearModuloAdminClubs({
    crearCasos: () => casos as unknown as ReturnType<typeof import("./casos-uso/admin-clubs").crearCasosUsoAdminClubs>,
    ejecutarEnTransaccion: async (_contexto, operacion) => operacion({
      casos: casos as unknown as ReturnType<typeof import("./casos-uso/admin-clubs").crearCasosUsoAdminClubs>,
      repositorio: {
        obtenerClub: async () => ({ id: CLUB_ID, nombre: "Aventureros", descripcion: null, activo: true }),
        obtenerMembresia: async () => ({ rolMiembro: "miembro", unidoEn: new Date("2026-07-12T00:00:00.000Z") }),
        obtenerReto: async () => ({ id: USUARIO_ID, clubId: CLUB_ID, nombre: "Reto", fechaInicio: new Date("2026-07-12T00:00:00.000Z"), fechaFin: new Date("2026-07-19T00:00:00.000Z") }),
      } as unknown as ReturnType<typeof import("./clubs.repository").crearClubsRepository>,
      registrarAuditoria,
    }),
  }));
  return app;
}

function responderPerfil(rol: "administrador" | "usuario") {
  globalThis.fetch = (async () => new Response(JSON.stringify({
    id: rol === "administrador" ? "admin-1" : "usuario-1",
    rol,
    proveedor: "invitado",
    nombre_visible: "Semillero",
    correo: null,
    activo: true,
    token_invitado_hash: TOKEN_INVITADO_HASH,
  }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })) as unknown as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

describe("rutas administrativas de clubes", () => {
  it("rechaza a un usuario no administrador", async () => {
    responderPerfil("usuario");
    const app = crearApp({
      listar: async () => ({ items: [], meta: { total: 0 } }),
      quitarMiembro: async () => ({ removed: true }),
    }, async () => undefined);

    const response = await app.fetch(new Request("http://localhost/administracion/clubes", {
      headers: cabecerasUsuario,
    }), env);

    expect(response.status).toBe(403);
  });

  it("lista clubes archivados para administrador", async () => {
    responderPerfil("administrador");
    let filtros: unknown;
    const app = crearApp({
      listar: async (entrada) => {
        filtros = entrada;
        return {
          clubes: [{
            id: "club-1",
            nombre: "Aventureros",
            descripcion: null,
            activo: false,
            creado_en: "2026-07-12T00:00:00.000Z",
            miembros: 2,
            retos_abiertos: 1,
            lider: { usuario_id: "lider-1", apodo: "Semillero" },
          }],
          meta: { total: 1, limit: 20, offset: 0 },
        };
      },
      quitarMiembro: async () => ({ removed: true }),
    }, async () => undefined);

    const response = await app.fetch(new Request("http://localhost/administracion/clubes?estado=archivado", {
      headers: cabecerasAdmin,
    }), env);
    const cuerpo = await response.json() as {
      datos: {
        clubes: Array<{
          id: string;
          nombre: string;
          descripcion: string | null;
          activo: boolean;
          creado_en: string;
          miembros: number;
          retos_abiertos: number;
          lider: { usuario_id: string; apodo: string } | null;
        }>;
        meta: { total: number; limit: number; offset: number };
      };
    };

    expect(response.status).toBe(200);
    expect(cuerpo.datos).toEqual({
      clubes: [{
        id: "club-1",
        nombre: "Aventureros",
        descripcion: null,
        activo: false,
        creado_en: "2026-07-12T00:00:00.000Z",
        miembros: 2,
        retos_abiertos: 1,
        lider: { usuario_id: "lider-1", apodo: "Semillero" },
      }],
      meta: { total: 1, limit: 20, offset: 0 },
    });
    expect(filtros).toEqual({ activo: false, orden: "recientes", limit: 20, offset: 0 });
  });

  it("crea un club con responsable inicial y registra auditoría sin guardar el código", async () => {
    responderPerfil("administrador");
    const auditoria: Array<Record<string, unknown>> = [];
    const app = crearApp({
      listar: async () => ({ items: [], meta: { total: 0 } }),
      quitarMiembro: async () => ({ removed: true }),
      crear: async () => ({
        id: CLUB_ID,
        nombre: "Aventureros",
        descripcion: null,
        codigo_invitacion: "SECRETO1",
        activo: true,
        creado_en: "2026-07-12T00:00:00.000Z",
        lider: { usuario_id: USUARIO_ID, apodo: "Semillero" },
      }),
    }, async (registro) => {
      auditoria.push(registro);
    });

    const response = await app.fetch(new Request("http://localhost/administracion/clubes", {
      method: "POST",
      headers: { ...cabecerasAdmin, "content-type": "application/json" },
      body: JSON.stringify({ nombre: "Aventureros", lider_usuario_id: USUARIO_ID }),
    }), env);
    const cuerpo = await response.json() as { datos: { codigo_invitacion: string } };

    expect(response.status).toBe(201);
    expect(cuerpo.datos.codigo_invitacion).toBe("SECRETO1");
    expect(auditoria).toHaveLength(1);
    expect(auditoria[0]).toMatchObject({
      accion: "club.creado",
      entidad_id: CLUB_ID,
      datos_despues: { nombre: "Aventureros", lider: { usuario_id: USUARIO_ID } },
    });
    expect(JSON.stringify(auditoria[0])).not.toContain("SECRETO1");
  });

  it("registra auditoria al expulsar un miembro", async () => {
    responderPerfil("administrador");
    const auditoria: Array<Record<string, unknown>> = [];
    const app = crearApp({
      listar: async () => ({ items: [], meta: { total: 0 } }),
      quitarMiembro: async () => ({ removed: true }),
    }, async (registro) => {
      auditoria.push(registro);
    });

    const response = await app.fetch(new Request(`http://localhost/administracion/clubes/${CLUB_ID}/miembros/${USUARIO_ID}`, {
      method: "DELETE",
      headers: cabecerasAdmin,
    }), env);

    expect(response.status).toBe(200);
    expect(auditoria).toContainEqual(expect.objectContaining({
      actor_usuario_id: "admin-1",
      accion: "club.miembro_expulsado",
      tipo_entidad: "club",
      entidad_id: CLUB_ID,
      datos_despues: { usuario_id: USUARIO_ID, club_id: CLUB_ID, rol_miembro: "miembro", unido_en: "2026-07-12T00:00:00.000Z" },
    }));
  });

  it("no registra auditoria cuando la creacion de un reto falla por regla de dominio", async () => {
    responderPerfil("administrador");
    const auditoria: Array<Record<string, unknown>> = [];
    const app = crearApp({
      listar: async () => ({ items: [], meta: { total: 0 } }),
      quitarMiembro: async () => ({ removed: true }),
      crearReto: async () => ({
        error: { mensaje: "Club no encontrado", codigo: "NOT_FOUND", estado: 404 },
      }),
    }, async (registro) => {
      auditoria.push(registro);
    });

    const response = await app.fetch(new Request(`http://localhost/administracion/clubes/${CLUB_ID}/retos`, {
      method: "POST",
      headers: { ...cabecerasAdmin, "content-type": "application/json" },
      body: JSON.stringify({
        nombre: "Reto de lectura",
        codigo_metrica: "temas_completados",
        valor_objetivo: 10,
        fecha_inicio: "2026-07-12T00:00:00.000Z",
        fecha_fin: "2026-07-19T00:00:00.000Z",
      }),
    }), env);

    expect(response.status).toBe(404);
    expect(auditoria).toEqual([]);
  });

  it.each([
    ["GET", "/administracion/clubes/id-invalido", undefined],
    ["PATCH", "/administracion/clubes/id-invalido", { nombre: "Club válido" }],
    ["POST", "/administracion/clubes/id-invalido/miembros", { usuario_id: USUARIO_ID }],
    ["POST", "/administracion/clubes/id-invalido/regenerar-codigo", undefined],
    ["POST", "/administracion/clubes/id-invalido/archivar", undefined],
    ["POST", "/administracion/clubes/id-invalido/reactivar", undefined],
    ["DELETE", "/administracion/clubes/id-invalido/miembros/usuario-invalido", undefined],
    ["POST", "/administracion/clubes/id-invalido/transferir-liderazgo", { usuario_id: "00000000-0000-4000-8000-000000000002" }],
    ["POST", "/administracion/clubes/id-invalido/retos", {
      nombre: "Reto de lectura",
      codigo_metrica: "temas_completados",
      valor_objetivo: 10,
      fecha_inicio: "2026-07-12T00:00:00.000Z",
      fecha_fin: "2026-07-19T00:00:00.000Z",
    }],
    ["POST", "/administracion/clubes/id-invalido/retos/reto-invalido/cerrar", { motivo: "Cierre administrativo" }],
  ])("rechaza IDs invalidos en %s %s", async (metodo, ruta, cuerpo) => {
    responderPerfil("administrador");
    const app = crearApp({
      listar: async () => ({ items: [], meta: { total: 0 } }),
      quitarMiembro: async () => ({ removed: true }),
    }, async () => undefined);

    const response = await app.fetch(new Request(`http://localhost${ruta}`, {
      method: metodo,
      headers: { ...cabecerasAdmin, ...(cuerpo ? { "content-type": "application/json" } : {}) },
      ...(cuerpo ? { body: JSON.stringify(cuerpo) } : {}),
    }), env);

    expect(response.status).toBe(400);
  });

  it.each([
    ["actualiza", "PATCH", `/administracion/clubes/${CLUB_ID}`, { nombre: "Nuevo nombre" }, "actualizar", { id: CLUB_ID }, 200],
    ["agrega miembro", "POST", `/administracion/clubes/${CLUB_ID}/miembros`, { usuario_id: USUARIO_ID }, "agregarMiembro", { added: true }, 201],
    ["regenera código", "POST", `/administracion/clubes/${CLUB_ID}/regenerar-codigo`, undefined, "regenerarCodigo", { codigo_invitacion: "NUEVO123" }, 200],
    ["archiva", "POST", `/administracion/clubes/${CLUB_ID}/archivar`, undefined, "archivar", { archived: true }, 200],
    ["reactiva", "POST", `/administracion/clubes/${CLUB_ID}/reactivar`, undefined, "reactivar", { reactivated: true }, 200],
    ["expulsa", "DELETE", `/administracion/clubes/${CLUB_ID}/miembros/${USUARIO_ID}`, undefined, "quitarMiembro", { removed: true }, 200],
    ["transfiere", "POST", `/administracion/clubes/${CLUB_ID}/transferir-liderazgo`, { usuario_id: USUARIO_ID }, "transferirLiderazgo", { transferred: true }, 200],
    ["crea reto", "POST", `/administracion/clubes/${CLUB_ID}/retos`, {
      nombre: "Reto de lectura", codigo_metrica: "temas_completados", valor_objetivo: 10,
      fecha_inicio: "2026-07-12T00:00:00.000Z", fecha_fin: "2026-07-19T00:00:00.000Z",
    }, "crearReto", { id: USUARIO_ID }, 201],
    ["cierra reto", "POST", `/administracion/clubes/${CLUB_ID}/retos/${USUARIO_ID}/cerrar`, { motivo: "Cierre administrativo" }, "cerrarReto", { closed: true }, 200],
  ])("%s registra auditoria al tener exito", async (_nombre, metodo, ruta, cuerpo, metodoCaso, resultado, estadoEsperado) => {
    responderPerfil("administrador");
    const auditoria: Array<Record<string, unknown>> = [];
    const casos = {
      listar: async () => ({ items: [], meta: { total: 0 } }),
      quitarMiembro: async () => ({ removed: true }),
      [metodoCaso as string]: async () => resultado,
    } as CasoAdminClubs;
    const app = crearApp(casos, async (registro) => { auditoria.push(registro); });

    const response = await app.fetch(new Request(`http://localhost${ruta}`, {
      method: metodo,
      headers: { ...cabecerasAdmin, ...(cuerpo ? { "content-type": "application/json" } : {}) },
      ...(cuerpo ? { body: JSON.stringify(cuerpo) } : {}),
    }), env);

    expect(response.status).toBe(estadoEsperado);
    expect(auditoria).toHaveLength(1);
    expect(auditoria[0]).toMatchObject({ entidad_id: CLUB_ID, actor_usuario_id: "admin-1" });
  });

  it.each([
    ["actualizar", "PATCH", `/administracion/clubes/${CLUB_ID}`, { nombre: "Nuevo nombre" }],
    ["agregarMiembro", "POST", `/administracion/clubes/${CLUB_ID}/miembros`, { usuario_id: USUARIO_ID }],
    ["regenerarCodigo", "POST", `/administracion/clubes/${CLUB_ID}/regenerar-codigo`, undefined],
    ["archivar", "POST", `/administracion/clubes/${CLUB_ID}/archivar`, undefined],
    ["reactivar", "POST", `/administracion/clubes/${CLUB_ID}/reactivar`, undefined],
    ["quitarMiembro", "DELETE", `/administracion/clubes/${CLUB_ID}/miembros/${USUARIO_ID}`, undefined],
    ["transferirLiderazgo", "POST", `/administracion/clubes/${CLUB_ID}/transferir-liderazgo`, { usuario_id: USUARIO_ID }],
    ["crearReto", "POST", `/administracion/clubes/${CLUB_ID}/retos`, {
      nombre: "Reto de lectura", codigo_metrica: "temas_completados", valor_objetivo: 10,
      fecha_inicio: "2026-07-12T00:00:00.000Z", fecha_fin: "2026-07-19T00:00:00.000Z",
    }],
    ["cerrarReto", "POST", `/administracion/clubes/${CLUB_ID}/retos/${USUARIO_ID}/cerrar`, { motivo: "Cierre administrativo" }],
  ])("no audita cuando %s devuelve un error de dominio", async (metodoCaso, metodo, ruta, cuerpo) => {
    responderPerfil("administrador");
    const auditoria: Array<Record<string, unknown>> = [];
    const casos = {
      listar: async () => ({ items: [], meta: { total: 0 } }),
      quitarMiembro: async () => ({ removed: true }),
      [metodoCaso as string]: async () => ({ error: { mensaje: "No encontrado", codigo: "NOT_FOUND", estado: 404 } }),
    } as CasoAdminClubs;
    const app = crearApp(casos, async (registro) => { auditoria.push(registro); });

    const response = await app.fetch(new Request(`http://localhost${ruta}`, {
      method: metodo,
      headers: { ...cabecerasAdmin, ...(cuerpo ? { "content-type": "application/json" } : {}) },
      ...(cuerpo ? { body: JSON.stringify(cuerpo) } : {}),
    }), env);

    expect(response.status).toBe(404);
    expect(auditoria).toEqual([]);
  });
});
