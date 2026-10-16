import { describe, expect, it } from "bun:test";
import app from "../../app";
import type { AppBindings } from "../../config/env";

const TOKEN_INVITADO = "guest-token-test-1234567890";
const TOKEN_INVITADO_HASH = "c9c27b711102ce6c9dd22f9b6b6b08bec1c294ce4b2a636e31c5a85c6f6ee6b2";

describe("admin.routes factory", () => {
  it("responde el resumen con counts desde Supabase", async () => {
    const fetchOriginal = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(String(input), init);
      const url = new URL(request.url);

      if (request.method === "HEAD" && url.pathname === "/rest/v1/usuario_app") {
        return new Response(null, {
          status: 200,
          headers: { "content-range": "0-4/5" }
        });
      }

      if (request.method === "GET" && url.pathname === "/rest/v1/usuario_app") {
        return new Response(JSON.stringify({ id: "usuario-admin", rol: "administrador", proveedor: "invitado", nombre_visible: "Admin", correo: null, activo: true, token_invitado_hash: TOKEN_INVITADO_HASH }), {
          status: 200,
          headers: { "content-type": "application/json" }
        });
      }

      if (request.method === "HEAD" && url.pathname === "/rest/v1/tema") {
        const esPublicado = url.searchParams.has("estado");
        return new Response(null, {
          status: 200,
          headers: { "content-range": esPublicado ? "0-11/12" : "0-11/12" }
        });
      }

      if (request.method === "HEAD" && url.pathname === "/rest/v1/actividad") {
        return new Response(null, {
          status: 200,
          headers: { "content-range": "0-8/9" }
        });
      }

      return new Response(JSON.stringify({ error: `Ruta no mockeada: ${request.method} ${url.pathname}` }), {
        status: 500,
        headers: { "content-type": "application/json" }
      });
    }) as typeof fetch;

    const response = await app.fetch(
      new Request("http://localhost/administracion/resumen", {
        headers: { "x-guest-user-id": "usuario-admin", "x-guest-token": TOKEN_INVITADO }
      }),
      {
        APP_ENV: "development",
        CORS_BASE_DOMAIN: "localhost",
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_ANON_KEY: "test-anon-key",
        SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
        SUPABASE_PROJECT_REF: "test-project-ref"
      } as AppBindings["Bindings"]
    );

    globalThis.fetch = fetchOriginal;

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      exito: boolean;
      datos: { temas: number; publicados: number; usuarios: number; actividades: number };
    };

    expect(body.datos).toEqual({ temas: 12, publicados: 12, usuarios: 5, actividades: 9 });
  });
});
