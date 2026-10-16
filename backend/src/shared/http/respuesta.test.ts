import { describe, expect, it } from "bun:test";
import { responderError, responderExito } from "./respuesta";

describe("respuesta", () => {
  it("incluye detalle opcional en respuestas de error", async () => {
    const response = responderError("No permitido", "FORBIDDEN", 403, {
      causa: "rol insuficiente"
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      exito: false,
      error: "No permitido",
      codigo: "FORBIDDEN",
      detalle: {
        causa: "rol insuficiente"
      }
    });
  });

  it("mantiene la respuesta de exito existente", async () => {
    const response = responderExito({ listo: true });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      exito: true,
      datos: { listo: true }
    });
  });
});
