import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import type { AppBindings } from "../../config/env";
import { crearRateLimitMiddleware, limpiarRateLimitMemoria } from "./rate-limit.middleware";

const env: AppBindings["Bindings"] = {
  APP_ENV: "test",
  CORS_BASE_DOMAIN: "localhost",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "test-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
};

describe("rateLimitMiddleware", () => {
  it("bloquea la sexta solicitud sensible y devuelve Retry-After", async () => {
    limpiarRateLimitMemoria();
    const app = new Hono<AppBindings>();
    app.use("*", crearRateLimitMiddleware("sensible"));
    app.get("/prueba", (c) => c.json({ ok: true }));

    for (let intento = 0; intento < 5; intento += 1) {
      expect((await app.request("/prueba", {}, env)).status).toBe(200);
    }
    const respuesta = await app.request("/prueba", {}, env);
    expect(respuesta.status).toBe(429);
    expect(respuesta.headers.get("Retry-After")).toBe("60");
    await expect(respuesta.json()).resolves.toMatchObject({ codigo: "RATE_LIMIT_EXCEEDED" });
  });

  it("usa la clave del binding de Cloudflare sin exponer tokens", async () => {
    const claves: string[] = [];
    const app = new Hono<AppBindings>();
    app.use("*", crearRateLimitMiddleware("publico"));
    app.get("/prueba", (c) => c.json({ ok: true }));
    const binding = { limit: async ({ key }: { key: string }) => { claves.push(key); return { success: true }; } };
    const respuesta = await app.request("/prueba", { headers: { authorization: "Bearer secreto", "x-guest-token": "guest-secreto" } }, { ...env, RATE_LIMITER: binding });

    expect(respuesta.status).toBe(200);
    expect(claves[0]).not.toContain("secreto");
  });
});
