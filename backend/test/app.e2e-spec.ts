import { describe, expect, it } from "bun:test";
import app from "../src/index";
import type { AppBindings } from "../src/config/env";

const env: AppBindings["Bindings"] = {
  APP_ENV: "test",
  CORS_ORIGIN: "http://localhost:3000",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "test-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
};

describe("Semillas API (e2e)", () => {
  it("GET /health responde con el contrato público actual", async () => {
    const respuesta = await app.fetch(new Request("http://localhost/health"), env);

    expect(respuesta.status).toBe(200);
    await expect(respuesta.json()).resolves.toEqual({
      exito: true,
      datos: {
        estado: "healthy",
        entorno: "test",
      },
    });
  });

  it("ruta inexistente devuelve 404", async () => {
    const respuesta = await app.request("/ruta-inexistente", {}, env);

    expect(respuesta.status).toBe(404);
  });

  it("rechaza mutaciones y recursos privados sin autenticación", async () => {
    const [admin, media] = await Promise.all([
      app.request("/administracion/resumen", {}, env),
      app.request("/media/550e8400-e29b-41d4-a716-446655440099/url", {}, env),
    ]);

    expect(admin.status).toBe(401);
    expect(media.status).toBe(401);
    await expect(admin.json()).resolves.toMatchObject({ exito: false, codigo: "UNAUTHORIZED" });
    await expect(media.json()).resolves.toMatchObject({ exito: false, codigo: "UNAUTHORIZED" });
  });

  it("rechaza un origen CORS no autorizado", async () => {
    const respuesta = await app.fetch(new Request("http://localhost/health", {
      headers: { Origin: "https://malicioso.example" },
    }), env);

    expect(respuesta.status).toBe(200);
    expect(respuesta.headers.get("access-control-allow-origin")).toBeNull();
  });
});
