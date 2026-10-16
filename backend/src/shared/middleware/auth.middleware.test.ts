import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import type { AppBindings } from "../../config/env";
import { authMiddleware } from "./auth.middleware";
import { errorHandler } from "./error-handler";

const env: AppBindings["Bindings"] = {
  APP_ENV: "test", CORS_BASE_DOMAIN: "localhost",
  SUPABASE_URL: "https://example.supabase.co", SUPABASE_ANON_KEY: "anon", SUPABASE_SERVICE_ROLE_KEY: "service",
};

describe("authMiddleware", () => {
  it("rechaza una petición sin Bearer ni credenciales invitadas", async () => {
    const app = new Hono<AppBindings>();
    app.use("*", authMiddleware);
    app.get("/privado", (c) => c.json({ ok: true }));
    app.onError(errorHandler);

    const respuesta = await app.request("/privado", {}, env);
    expect(respuesta.status).toBe(401);
    await expect(respuesta.json()).resolves.toMatchObject({ codigo: "UNAUTHORIZED" });
  });

  it("rechaza una sesión invitada incompleta antes de consultar la base", async () => {
    const app = new Hono<AppBindings>();
    app.use("*", authMiddleware);
    app.get("/privado", (c) => c.json({ ok: true }));
    app.onError(errorHandler);

    const respuesta = await app.request("/privado", { headers: { "x-guest-user-id": "usuario-1" } }, env);
    expect(respuesta.status).toBe(401);
    await expect(respuesta.json()).resolves.toMatchObject({ error: "La sesión invitada está incompleta" });
  });
});
