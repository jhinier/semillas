import { describe, expect, it } from "bun:test";
import type { AppBindings } from "../../config/env";
import type { DbClient } from "../../db/client";
import { crearModuloCatalogo } from "./catalog.routes";

const env: AppBindings["Bindings"] = {
  APP_ENV: "test",
  CORS_BASE_DOMAIN: "localhost",
  SUPABASE_URL: "https://ejemplo.supabase.co",
  SUPABASE_ANON_KEY: "anon-key-de-prueba",
  SUPABASE_SERVICE_ROLE_KEY: "service-key-de-prueba"
};

describe("catalogRoutes", () => {
  it("devuelve grupos etarios con imagen derivada", async () => {
    const dbMock = {
      select() {
        return {
          from() {
            return {
              orderBy: async () => [
                {
                  id: "grupo-1",
                  codigo: "SEMILLAS",
                  nombre: "Semillas",
                  edad_minima: 5,
                  edad_maxima: 8,
                  descripcion: "Niños pequeños",
                  orden: 1
                }
              ]
            };
          }
        };
      }
    } as unknown as DbClient;

    const app = crearModuloCatalogo({ db: dbMock });
    const response = await app.fetch(new Request("http://localhost/grupos-etarios"), env);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      exito: true,
      datos: [
        {
          id: "grupo-1",
          codigo: "SEMILLAS",
          nombre: "Semillas",
          edad_minima: 5,
          edad_maxima: 8,
          descripcion: "Niños pequeños",
          orden: 1,
          imagen_url: "https://ejemplo.supabase.co/storage/v1/object/public/imagenes/onboarding/semillas.png"
        }
      ]
    });
  });
});
