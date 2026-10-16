import { afterEach, describe, expect, it } from "bun:test";
import app from "../../app";
import type { AppBindings } from "../../config/env";

const env: AppBindings["Bindings"] = {
  APP_ENV: "development",
  CORS_BASE_DOMAIN: "localhost",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "test-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  SUPABASE_PROJECT_REF: "test-project-ref",
  ENABLE_DEV_ADMIN_SETUP: "true",
  DEV_ADMIN_EMAIL: "admin@correo.com",
  DEV_ADMIN_PASSWORD: "admin-test-1234",
  DEV_ADMIN_SETUP_TOKEN: "token-configuracion-test-1234",
};

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockearSupabase(casos: Array<{ metodo: string; path: string; responder: (request: Request) => Promise<Response> | Response }>) {
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
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
}

describe("auth.routes", () => {
  it("crea un administrador de desarrollo con correo y contraseña", async () => {
    const solicitudes: Array<{ path: string; body?: Record<string, unknown> }> = [];

    mockearSupabase([
      {
        metodo: "GET",
        path: "/rest/v1/usuario_app",
        responder: () =>
          new Response(JSON.stringify([]), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
      },
      {
        metodo: "POST",
        path: "/auth/v1/admin/users",
        responder: async (request) => {
          solicitudes.push({ path: "/auth/v1/admin/users", body: JSON.parse(await request.clone().text()) as Record<string, unknown> });

          return new Response(
            JSON.stringify({
              user: { id: "auth-admin-1" },
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        },
      },
      {
        metodo: "POST",
        path: "/rest/v1/usuario_app",
        responder: async (request) => {
          solicitudes.push({ path: "/rest/v1/usuario_app", body: JSON.parse(await request.clone().text()) as Record<string, unknown> });

          return new Response(
            JSON.stringify({
              id: "usuario-admin",
              rol: "administrador",
              proveedor: "correo",
              nombre_visible: "Admin Dev",
              correo: "admin@correo.com",
            }),
            { status: 201, headers: { "content-type": "application/json" } },
          );
        },
      },
      {
        metodo: "POST",
        path: "/rest/v1/perfil",
        responder: async (request) => {
          solicitudes.push({ path: "/rest/v1/perfil", body: JSON.parse(await request.clone().text()) as Record<string, unknown> });

          return new Response(
            JSON.stringify({
              id: "perfil-admin",
              usuario_id: "usuario-admin",
              apodo: "Admin Dev",
              grupo_edad_id: null,
              url_avatar: null,
              clave_avatar: null,
              prefiere_audio: false,
              tamano_texto_preferido: "mediano",
            }),
            { status: 201, headers: { "content-type": "application/json" } },
          );
        },
      },
    ]);

    const response = await app.fetch(new Request("http://localhost/autenticacion/configuracion-dev", {
      method: "POST",
      headers: { "x-dev-setup-token": "token-configuracion-test-1234" }
    }), env);
    const body = (await response.json()) as {
      exito: true;
      datos: { usuario: { correo: string; proveedor: string }; credenciales: { correo: string; password: string } };
    };

    expect(response.status).toBe(200);
    expect(body.datos.usuario.correo).toBe("admin@correo.com");
    expect(body.datos.usuario.proveedor).toBe("correo");
    expect(body.datos.credenciales).toEqual({ correo: "admin@correo.com", password: "admin-test-1234" });
    expect(solicitudes[0].path).toBe("/auth/v1/admin/users");
    expect(solicitudes[0].body).toMatchObject({
      email: "admin@correo.com",
      password: "admin-test-1234",
      email_confirm: true,
    });
  });

  it("eleva a administrador el usuario de desarrollo existente si no tiene ese rol", async () => {
    const solicitudes: Array<{ path: string; body?: Record<string, unknown> }> = [];

    mockearSupabase([
      {
        metodo: "GET",
        path: "/rest/v1/usuario_app",
        responder: () =>
          new Response(
            JSON.stringify({
              id: "usuario-existente",
              rol: "usuario",
              proveedor: "correo",
              nombre_visible: "Admin Dev",
              correo: "admin@correo.com",
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          ),
      },
      {
        metodo: "PATCH",
        path: "/rest/v1/usuario_app",
        responder: async (request) => {
          solicitudes.push({ path: "/rest/v1/usuario_app", body: JSON.parse(await request.clone().text()) as Record<string, unknown> });

          return new Response(
            JSON.stringify({
              id: "usuario-existente",
              rol: "administrador",
              proveedor: "correo",
              nombre_visible: "Admin Dev",
              correo: "admin@correo.com",
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        },
      },
      {
        metodo: "GET",
        path: "/rest/v1/perfil",
        responder: () =>
          new Response(
            JSON.stringify({
              id: "perfil-admin",
              usuario_id: "usuario-existente",
              apodo: "Admin Dev",
              grupo_edad_id: null,
              url_avatar: null,
              clave_avatar: null,
              prefiere_audio: false,
              tamano_texto_preferido: "mediano",
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          ),
      },
    ]);

    const response = await app.fetch(new Request("http://localhost/autenticacion/configuracion-dev", {
      method: "POST",
      headers: { "x-dev-setup-token": "token-configuracion-test-1234" }
    }), env);
    const body = (await response.json()) as {
      exito: true;
      datos: { usuario: { correo: string; rol: string }; credenciales: { correo: string; password: string } };
    };

    expect(response.status).toBe(200);
    expect(body.datos.usuario).toMatchObject({ correo: "admin@correo.com", rol: "administrador" });
    expect(body.datos.credenciales).toEqual({ correo: "admin@correo.com", password: "admin-test-1234" });
    expect(solicitudes[0]).toEqual({ path: "/rest/v1/usuario_app", body: { rol: "administrador" } });
  });
});
