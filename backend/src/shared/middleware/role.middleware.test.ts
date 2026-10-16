import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import type { AppBindings, AuthUser } from "../../config/env";
import { requireRole } from "./role.middleware";
import { errorHandler } from "./error-handler";

describe("roleMiddleware", () => {
  it("rechaza ausencia de usuario y roles no permitidos", async () => {
    const app = new Hono<AppBindings>();
    app.use("*", requireRole("administrador"));
    app.get("/admin", (c) => c.json({ ok: true }));
    app.onError(errorHandler);
    const env = {} as AppBindings["Bindings"];

    expect((await app.request("/admin", {}, env)).status).toBe(401);
    const usuario: AuthUser = { id: "u-1", role: "usuario", displayName: "Semilla", email: null, provider: "correo" };
    const conUsuario = new Hono<AppBindings>();
    conUsuario.use("*", (c, next) => { c.set("user", usuario); return next(); });
    conUsuario.use("*", requireRole("administrador"));
    conUsuario.get("/admin", (c) => c.json({ ok: true }));
    conUsuario.onError(errorHandler);
    expect((await conUsuario.request("/admin", {}, env)).status).toBe(403);
  });

  it("permite al administrador", async () => {
    const app = new Hono<AppBindings>();
    app.use("*", (c, next) => { c.set("user", { id: "a-1", role: "administrador", displayName: "Admin", email: null, provider: "correo" }); return next(); });
    app.use("*", requireRole("administrador"));
    app.get("/admin", (c) => c.json({ ok: true }));
    expect((await app.request("/admin", {}, {} as AppBindings["Bindings"])).status).toBe(200);
  });
});
