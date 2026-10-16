import { afterEach, describe, expect, it } from "bun:test";
import { Hono } from "hono";
import type { AppBindings } from "../../config/env";
import { errorHandler } from "../../shared/middleware/error-handler";
import { crearModuloAdminLogros } from "./admin-logros.routes";

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
const LOGRO_ID = "00000000-0000-4000-8000-000000000010";

const cabecerasAdmin = {
  "x-guest-user-id": "admin-1",
  "x-guest-token": TOKEN_INVITADO,
};

const cabecerasUsuario = {
  "x-guest-user-id": "usuario-1",
  "x-guest-token": TOKEN_INVITADO,
};

type CasoAdminLogros = {
  listar: (filtros: { q?: string; activo?: boolean; criterio?: string; limit: number; offset: number }) => Promise<unknown>;
  listarCatalogoOrdenado: () => Promise<unknown>;
  obtenerDetalle: (id: string) => Promise<unknown>;
  crear: (entrada: unknown, administradorId: string) => Promise<unknown>;
  actualizar: (id: string, entrada: unknown) => Promise<unknown>;
  archivar: (id: string) => Promise<unknown>;
  reactivar: (id: string) => Promise<unknown>;
};

function responderPerfil(rol: "administrador" | "usuario") {
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        id: rol === "administrador" ? "admin-1" : "usuario-1",
        rol,
        proveedor: "invitado",
        nombre_visible: "Semillero",
        correo: null,
        activo: true,
        token_invitado_hash: TOKEN_INVITADO_HASH,
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    )) as unknown as typeof fetch;
}

function crearApp(casos: Partial<CasoAdminLogros>, erroresAuditoria: unknown[] = []) {
  const repo: any = {
    async obtener(id: string) {
      return casos.obtenerDetalle
        ? (await casos.obtenerDetalle(id)) ?? {
            id,
            codigo: "primer-tema",
            nombre: "Primer tema",
            descripcion: null,
            urlIcono: null,
            bonoXp: 30,
            codigoCriterio: "temas_completados",
            valorCriterio: 1,
            activo: true,
            creadoEn: new Date("2026-07-13T00:00:00.000Z"),
          }
        : {
            id,
            codigo: "primer-tema",
            nombre: "Primer tema",
            descripcion: null,
            urlIcono: null,
            bonoXp: 30,
            codigoCriterio: "temas_completados",
            valorCriterio: 1,
            activo: true,
            creadoEn: new Date("2026-07-13T00:00:00.000Z"),
          };
    },
  };
  const app = new Hono<AppBindings>();
  app.onError(errorHandler);
  app.route(
    "/administracion/logros",
    crearModuloAdminLogros({
      crearCasos: () =>
        casos as unknown as ReturnType<typeof import("./casos-uso/admin-logros").crearCasosUsoAdminLogros>,
      ejecutarEnTransaccion: async (_contexto, operacion) =>
        operacion({
          casos: casos as unknown as ReturnType<typeof import("./casos-uso/admin-logros").crearCasosUsoAdminLogros>,
          repositorio: repo as unknown as ReturnType<
            typeof import("./admin-logros.repository").crearAdminLogrosRepository
          >,
          registrarAuditoria: async (registro) => {
            erroresAuditoria.push(registro);
          },
        }),
    }),
  );
  return app;
}

afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

describe("rutas administrativas de logros", () => {
  it("lista logros con filtros", async () => {
    responderPerfil("administrador");
    const casos: Partial<CasoAdminLogros> = {
      async listar() {
        return {
          logros: [
            {
              id: LOGRO_ID,
              codigo: "primer-tema",
              nombre: "Primer tema",
              descripcion: null,
              url_icono: null,
              bono_xp: 30,
              codigo_criterio: "temas_completados",
              valor_criterio: 1,
              activo: true,
              creado_en: "2026-07-13T00:00:00.000Z",
              otorgados: 5,
            },
          ],
          meta: { total: 1, limit: 20, offset: 0 },
        };
      },
    };
    const app = crearApp(casos);
    const response = await app.fetch(
      new Request("http://localhost/administracion/logros?estado=activo&limit=10", {
        headers: cabecerasAdmin,
      }),
      env,
    );
    expect(response.status).toBe(200);
    const cuerpo = (await response.json()) as {
      exito: boolean;
      datos: { logros: unknown[]; meta: { total: number } };
    };
    expect(cuerpo.exito).toBe(true);
    expect(cuerpo.datos.logros).toHaveLength(1);
    expect(cuerpo.datos.meta.total).toBe(1);
  });

  it("rechaza a un usuario sin rol administrador", async () => {
    responderPerfil("usuario");
    const app = crearApp({});
    const response = await app.fetch(
      new Request("http://localhost/administracion/logros", { headers: cabecerasUsuario }),
      env,
    );
    expect(response.status).toBe(403);
  });

  it("crea un logro y registra auditoría", async () => {
    responderPerfil("administrador");
    const auditoria: unknown[] = [];
    const casos: Partial<CasoAdminLogros> = {
      async crear() {
        return {
          id: LOGRO_ID,
          codigo: "primer-tema",
          nombre: "Primer tema",
          descripcion: null,
          url_icono: null,
          bono_xp: 30,
          codigo_criterio: "temas_completados",
          valor_criterio: 1,
          activo: true,
          creado_en: "2026-07-13T00:00:00.000Z",
          otorgados: 0,
        };
      },
    };
    const app = crearApp(casos, auditoria);
    const response = await app.fetch(
      new Request("http://localhost/administracion/logros", {
        method: "POST",
        headers: { ...cabecerasAdmin, "content-type": "application/json" },
        body: JSON.stringify({
          codigo: "primer-tema",
          nombre: "Primer tema",
          codigo_criterio: "temas_completados",
          valor_criterio: 1,
          bono_xp: 30,
        }),
      }),
      env,
    );
    expect(response.status).toBe(201);
    expect(auditoria).toHaveLength(1);
    expect((auditoria[0] as { accion: string }).accion).toBe("logro.creado");
  });

  it("rechaza la creación con código duplicado", async () => {
    responderPerfil("administrador");
    const casos: Partial<CasoAdminLogros> = {
      async crear() {
        return {
          error: { mensaje: "Ya existe un logro con ese código", codigo: "CODIGO_DUPLICADO", estado: 409 },
        };
      },
    };
    const app = crearApp(casos);
    const response = await app.fetch(
      new Request("http://localhost/administracion/logros", {
        method: "POST",
        headers: { ...cabecerasAdmin, "content-type": "application/json" },
        body: JSON.stringify({
          codigo: "primer-tema",
          nombre: "Primer tema",
          codigo_criterio: "temas_completados",
          valor_criterio: 1,
          bono_xp: 30,
        }),
      }),
      env,
    );
    expect(response.status).toBe(409);
    const cuerpo = (await response.json()) as { exito: boolean; codigo: string };
    expect(cuerpo.exito).toBe(false);
    expect(cuerpo.codigo).toBe("CODIGO_DUPLICADO");
  });

  it("obtiene el detalle de un logro existente", async () => {
    responderPerfil("administrador");
    const casos: Partial<CasoAdminLogros> = {
      async obtenerDetalle() {
        return {
          id: LOGRO_ID,
          codigo: "primer-tema",
          nombre: "Primer tema",
          descripcion: null,
          url_icono: null,
          bono_xp: 30,
          codigo_criterio: "temas_completados",
          valor_criterio: 1,
          activo: true,
          creado_en: "2026-07-13T00:00:00.000Z",
          otorgados: 5,
        };
      },
    };
    const app = crearApp(casos);
    const response = await app.fetch(
      new Request(`http://localhost/administracion/logros/${LOGRO_ID}`, {
        headers: cabecerasAdmin,
      }),
      env,
    );
    expect(response.status).toBe(200);
  });

  it("devuelve 404 cuando el detalle no existe", async () => {
    responderPerfil("administrador");
    const casos: Partial<CasoAdminLogros> = {
      async obtenerDetalle() {
        return {
          error: { mensaje: "Logro no encontrado", codigo: "NOT_FOUND", estado: 404 },
        };
      },
    };
    const app = crearApp(casos);
    const response = await app.fetch(
      new Request(`http://localhost/administracion/logros/${LOGRO_ID}`, {
        headers: cabecerasAdmin,
      }),
      env,
    );
    expect(response.status).toBe(404);
  });

  it("actualiza un logro y registra auditoría", async () => {
    responderPerfil("administrador");
    const auditoria: unknown[] = [];
    const casos: Partial<CasoAdminLogros> = {
      async actualizar() {
        return {
          id: LOGRO_ID,
          codigo: "primer-tema",
          nombre: "Primer tema actualizado",
          descripcion: null,
          url_icono: null,
          bono_xp: 60,
          codigo_criterio: "temas_completados",
          valor_criterio: 1,
          activo: true,
          creado_en: "2026-07-13T00:00:00.000Z",
          otorgados: 5,
        };
      },
    };
    const app = crearApp(casos, auditoria);
    const response = await app.fetch(
      new Request(`http://localhost/administracion/logros/${LOGRO_ID}`, {
        method: "PATCH",
        headers: { ...cabecerasAdmin, "content-type": "application/json" },
        body: JSON.stringify({ bono_xp: 60 }),
      }),
      env,
    );
    expect(response.status).toBe(200);
    expect(auditoria).toHaveLength(1);
    expect((auditoria[0] as { accion: string }).accion).toBe("logro.actualizado");
  });

  it("archiva un logro", async () => {
    responderPerfil("administrador");
    const casos: Partial<CasoAdminLogros> = {
      async archivar() {
        return { archived: true };
      },
    };
    const app = crearApp(casos);
    const response = await app.fetch(
      new Request(`http://localhost/administracion/logros/${LOGRO_ID}/archivar`, {
        method: "POST",
        headers: cabecerasAdmin,
      }),
      env,
    );
    expect(response.status).toBe(200);
  });

  it("rechaza la actualización con cuerpo vacío", async () => {
    responderPerfil("administrador");
    const app = crearApp({});
    const response = await app.fetch(
      new Request(`http://localhost/administracion/logros/${LOGRO_ID}`, {
        method: "PATCH",
        headers: { ...cabecerasAdmin, "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
      env,
    );
    expect(response.status).toBe(400);
  });

  it("rechaza IDs inválidos en path params", async () => {
    responderPerfil("administrador");
    const app = crearApp({});
    const response = await app.fetch(
      new Request("http://localhost/administracion/logros/id-invalido", {
        headers: cabecerasAdmin,
      }),
      env,
    );
    expect(response.status).toBe(400);
  });
});