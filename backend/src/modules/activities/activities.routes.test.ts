import { describe, expect, it } from "bun:test";
import { createMiddleware } from "hono/factory";
import type { AppBindings } from "../../config/env";
import type { DbClient } from "../../db/client";
import { crearModuloActivities } from "./activities.routes";

describe("activities.routes", () => {
  it("registra progreso al responder correctamente", async () => {
    const llamadas: string[] = [];

    const dbMock = {
      select(consulta?: Record<string, unknown>) {
        return {
          from() {
            const chain = {
              innerJoin() {
                return chain;
              },
              where() {
                if (!consulta) return Promise.resolve([]);

                return {
                  limit: async () => {
                    const columnas = Object.keys(consulta ?? {}).join(",");
                    llamadas.push(`select:${columnas}`);

                    if (columnas.includes("xpRecompensa")) {
                      return [{ id: "act-1", temaId: "tema-1", xpRecompensa: 10 }];
                    }

                    if (columnas.includes("correcta")) {
                      return [{ id: "opc-1", correcta: true }];
                    }

                    if (columnas.includes("actividadId") && columnas.includes("tipoActividadId")) {
                      return [{
                        id: "act-1",
                        temaId: "tema-1",
                        pasoId: null,
                        grupoEdadId: "grupo-1",
                        tipoActividadId: "tipo-1",
                        titulo: "Actividad",
                        consigna: "Contesta",
                        orden: 1,
                        xpRecompensa: 10,
                        dificultad: "facil",
                        limiteTiempoSeg: null,
                        obligatorio: true,
                        retroalimentacion: null,
                        configuracion: {},
                        creadoEn: new Date(),
                        actualizadoEn: new Date()
                      }];
                    }

                    return [
                      {
                        id: "act-1",
                        temaId: "tema-1",
                        pasoId: null,
                        grupoEdadId: "grupo-1",
                        tipoActividadId: "tipo-1",
                        titulo: "Actividad",
                        consigna: "Contesta",
                        orden: 1,
                        xpRecompensa: 10,
                        dificultad: "facil",
                        limiteTiempoSeg: null,
                        obligatorio: true,
                        retroalimentacion: null,
                        configuracion: {},
                        creadoEn: new Date(),
                        actualizadoEn: new Date()
                      }
                    ];
                  },
                  groupBy() {
                    return {
                      orderBy() {
                        return {
                          limit: async () => [],
                        };
                      },
                    };
                  },
                  orderBy: async () => []
                };
              },
              orderBy: async () => []
            };

            return chain;
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
              },
              onConflictDoUpdate() {
                llamadas.push("upsert:progreso");
                return Promise.resolve(undefined);
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

    const app = crearModuloActivities({ db: dbMock, authMiddleware: authStub });

    const response = await app.fetch(
      new Request("http://localhost/act-1/responder", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          evento_id_cliente: "550e8400-e29b-41d4-a716-446655440000",
          opcion_id_seleccionada: "550e8400-e29b-41d4-a716-446655440030"
        })
      })
    );

    expect(response.status).toBe(201);
    expect(llamadas).toEqual(expect.arrayContaining(["insert:evento", "upsert:progreso"]));
  });
});
