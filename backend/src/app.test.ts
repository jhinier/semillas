import { describe, expect, it } from "bun:test";
import app from "./app";
import type { AppBindings } from "./config/env";

const env: AppBindings["Bindings"] = {
  APP_ENV: "development",
  CORS_BASE_DOMAIN: "localhost",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "test-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  SUPABASE_PROJECT_REF: "test-project-ref"
};

describe("app", () => {
  it("expone la raiz de la API en español", async () => {
    const response = await app.fetch(new Request("http://localhost/"), env);
    const body = (await response.json()) as {
      exito: true;
      datos: { nombre: string; version: string };
    };

    expect(response.status).toBe(200);
    expect(body).toEqual({
      exito: true,
      datos: {
        nombre: "Semillas",
        version: "0.1.0"
      }
    });
  });

  it("mantiene viva la ruta health", async () => {
    const response = await app.fetch(
      new Request("http://localhost/health", {
        headers: { "x-request-id": "req-health" }
      }),
      env
    );
    const body = (await response.json()) as {
      exito: true;
      datos: { estado: string; entorno: string };
    };

    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBe("req-health");
    expect(body).toEqual({
      exito: true,
      datos: {
        estado: "healthy",
        entorno: "development"
      }
    });
  });
});
