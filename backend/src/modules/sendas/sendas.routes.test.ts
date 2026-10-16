import { describe, expect, it } from "bun:test";
import type { DbClient } from "../../db/client";
import { crearModuloSendas } from "./sendas.routes";

describe("sendasRoutes", () => {
  it("devuelve sendas activas serializadas y ordenadas", async () => {
    const dbMock = {
      select() {
        return {
          from() {
            return {
              where() {
                return {
                  orderBy: async () => [
                    {
                      id: "senda-1",
                      codigo: "PADRE",
                      nombre: "Padre",
                      descripcion: "Senda padre",
                      colorHex: "#123456",
                      nombreIcono: "sun",
                      orden: 1,
                      activo: true
                    },
                    {
                      id: "senda-2",
                      codigo: "HIJO",
                      nombre: "Hijo",
                      descripcion: null,
                      colorHex: "#654321",
                      nombreIcono: null,
                      orden: 2,
                      activo: true
                    }
                  ]
                };
              }
            };
          }
        };
      }
    } as unknown as DbClient;

    const app = crearModuloSendas({ db: dbMock });
    const response = await app.fetch(new Request("http://localhost/"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      exito: true,
      datos: [
        {
          id: "senda-1",
          codigo: "PADRE",
          nombre: "Padre",
          descripcion: "Senda padre",
          color_hex: "#123456",
          nombre_icono: "sun",
          orden: 1
        },
        {
          id: "senda-2",
          codigo: "HIJO",
          nombre: "Hijo",
          descripcion: null,
          color_hex: "#654321",
          nombre_icono: null,
          orden: 2
        }
      ]
    });
  });
});
