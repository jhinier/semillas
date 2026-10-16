import { describe, expect, it } from "bun:test";
import { createMiddleware } from "hono/factory";
import type { AppBindings } from "../../config/env";
import type { DbClient } from "../../db/client";
import { crearModuloProgress } from "./progress.routes";

describe("progress.routes", () => {
  it("devuelve el progreso propio y registra eventos idempotentes", async () => {
    const llamadas: string[] = [];

    const dbMock = {
      select(consulta?: Record<string, unknown>) {
        return {
          from() {
            return {
              where() {
                const columnas = Object.keys(consulta ?? {}).join(",");
                llamadas.push(`select:${columnas}`);

                if (columnas.includes("progresoTemaUsuario")) {
                  return [
                    {
                      usuarioId: "usuario-1",
                      temaId: "tema-1",
                      estado: "en_progreso",
                      porcentaje: 50,
                      iniciadoEn: new Date("2026-01-01T00:00:00.000Z"),
                      completadoEn: null,
                      ultimoPasoId: null,
                      actualizadoEn: new Date("2026-01-02T00:00:00.000Z")
                    }
                  ] as never;
                }

                if (columnas.includes("progresoActividadUsuario")) {
                  return [
                    {
                      usuarioId: "usuario-1",
                      actividadId: "act-1",
                      intentos: 2,
                      mejorPuntaje: 100,
                      completado: true,
                      completadoEn: new Date("2026-01-03T00:00:00.000Z"),
                      actualizadoEn: new Date("2026-01-04T00:00:00.000Z")
                    }
                  ] as never;
                }

                return [] as never;
              }
            };
          }
        };
      },
      insert() {
        return {
          values() {
            return {
              onConflictDoNothing() {
                llamadas.push("insert:evento");
                return {
                  returning: async () => [{ id: "evento-1" }]
                };
              }
            };
          }
        };
      }
    } as unknown as DbClient;

    const authStub = createMiddleware<AppBindings>(async (c, next) => {
      c.set("user", {
        id: "usuario-1",
        role: "invitado",
        displayName: "Semillero",
        email: null,
        provider: "invitado"
      });

      await next();
    });

    const app = crearModuloProgress({ db: dbMock, authMiddleware: authStub });

    const respuestaMi = await app.fetch(new Request("http://localhost/mi"));
    expect(respuestaMi.status).toBe(200);

    const respuestaEvento = await app.fetch(
      new Request("http://localhost/eventos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          evento_id_cliente: "550e8400-e29b-41d4-a716-446655440000",
          tipo_evento: "actividad_respondida",
          actividad_id: "550e8400-e29b-41d4-a716-446655440001"
        })
      })
    );

    expect(respuestaEvento.status).toBe(201);
    expect(llamadas).toContain("insert:evento");
  });
});
