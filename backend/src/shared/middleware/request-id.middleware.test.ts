import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import type { AppBindings } from "../../config/env";

describe("requestIdMiddleware", () => {
  it("propaga un request id existente y lo expone en el contexto", async () => {
    const { requestIdMiddleware } = await import("./request-id.middleware");
    const app = new Hono<AppBindings>();

    app.use("*", requestIdMiddleware());
    app.get("/", (c) => {
      return c.json({ requestId: c.get("requestId") });
    });

    const response = await app.fetch(
      new Request("http://localhost/", {
        headers: { "x-request-id": "req-123" }
      }),
      {
        APP_ENV: "test",
        CORS_BASE_DOMAIN: "localhost",
        SUPABASE_URL: "https://ejemplo.supabase.co",
        SUPABASE_ANON_KEY: "anon-key-de-prueba",
        SUPABASE_SERVICE_ROLE_KEY: "service-key-de-prueba"
      }
    );

    expect(response.headers.get("x-request-id")).toBe("req-123");
    await expect(response.json()).resolves.toEqual({ requestId: "req-123" });
  });
});
