import { describe, expect, it } from "bun:test";
import { createMiddleware } from "hono/factory";
import type { AppBindings } from "../../config/env";
import type { DbClient } from "../../db/client";
import { crearModuloUsuarios } from "./users.routes";

describe("users.routes", () => {
  it("reclama una cuenta invitada para una sesión autenticada", async () => {
    const actualizacion: Record<string, unknown>[] = [];

    let selectCallCount = 0;

    const dbMock = {
      transaction: async (callback: (tx: unknown) => Promise<unknown>) => callback(dbMock),
      update() {
        return {
          set(datos: Record<string, unknown>) {
            actualizacion.push(datos);

            return {
              where() {
                return {
                  returning: async () => [
                    {
                      id: "usuario-invitado",
                      rol: "invitado",
                      proveedor: "google",
                      nombre_visible: "Visitante",
                      correo: "semillero@ejemplo.com"
                    }
                  ]
                };
              }
            };
          }
        };
      },
      select() {
        return {
          from() {
            return {
              where() {
                return {
                  limit: async () => {
                    selectCallCount++;

                    if (selectCallCount === 1) {
                      return [];
                    }

                    return [
                      {
                        id: "perfil-1",
                        usuarioId: "usuario-invitado",
                        apodo: "Visitante",
                        grupoEdadId: null,
                        urlAvatar: null,
                        claveAvatar: null,
                        prefiereAudio: false,
                        tamanoTextoPreferido: "mediano"
                      }
                    ];
                  }
                };
              }
            };
          }
        };
      }
    } as unknown as DbClient;

    const authMiddlewareStub = createMiddleware<AppBindings>(async (c, next) => {
      c.set("user", {
        id: "usuario-invitado",
        role: "invitado",
        displayName: "Visitante",
        email: null,
        provider: "invitado"
      });

      c.set("authSessionUser", {
        id: "auth-1",
        displayName: "Semillero",
        email: "semillero@ejemplo.com",
        provider: "google"
      });

      await next();
    });

    const app = crearModuloUsuarios({ db: dbMock, authMiddleware: authMiddlewareStub });

    const response = await app.fetch(new Request("http://localhost/vincular-cuenta", { method: "POST" }));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");

    const body = (await response.json()) as {
      exito: true;
      datos: {
        usuario: { id: string; proveedor: string; correo: string | null };
        perfil: { id: string } | null;
        vinculada: boolean;
      };
    };

    expect(body.datos.vinculada).toBe(true);
    expect(body.datos.usuario.id).toBe("usuario-invitado");
    expect(body.datos.usuario.proveedor).toBe("google");
    expect(body.datos.usuario.correo).toBe("semillero@ejemplo.com");
    expect(body.datos.perfil?.id).toBe("perfil-1");
    expect(actualizacion[0]).toMatchObject({
      idExterno: "auth-1",
      proveedor: "google",
      correo: "semillero@ejemplo.com",
      tokenInvitadoHash: null
    });
  });
});
