import { describe, expect, it } from "bun:test";
import { createMiddleware } from "hono/factory";
import type { AppBindings } from "../../config/env";
import type { DbClient } from "../../db/client";
import { crearModuloActivities } from "./activities.routes";

describe("activities factory", () => {
  it("responde actividad y registra progreso sin usar red externa", async () => {
    const llamadas: string[] = [];

    const dbMock = {
      select(consulta?: Record<string, unknown>) {
        const selector = {
          from() {
            const chain = {
              innerJoin() {
                return chain;
              },
              where() {
                if (!consulta) return Promise.resolve([]);

                return {
                  limit: async () => {
                    llamadas.push(`select:${Object.keys(consulta ?? {}).join(",")}`);

                    if (consulta && "id" in consulta && "xpRecompensa" in consulta) {
                      return [{ id: "act-1", temaId: "tema-1", xpRecompensa: 10 }];
                    }

                    if (consulta && "id" in consulta && "correcta" in consulta) {
                      return [{ id: "opc-1", correcta: true }];
                    }

                    return [];
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
                  orderBy: async () => {
                    llamadas.push(`select:${Object.keys(consulta ?? {}).join(",")}:orderBy`);

                    return [];
                  }
                };
              },
              orderBy: async () => {
                llamadas.push(`select:${Object.keys(consulta ?? {}).join(",")}:orderBy`);
                return [];
              }
            };

            return chain;
          }
        };

        return selector;
      },
      insert() {
        return {
          values() {
            return {
              onConflictDoNothing() {
                return {
                  returning: async () => [{ id: "evento-1" }]
                };
              },
              onConflictDoUpdate() {
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
          opcion_id_seleccionada: "550e8400-e29b-41d4-a716-446655440001"
        })
      })
    );

    expect(response.status).toBe(201);
    expect(llamadas.length).toBeGreaterThan(0);
  });
});
