import { describe, expect, it } from "bun:test";
import { obtenerVariablesViewportVisible } from "./visual-viewport";

describe("obtenerVariablesViewportVisible", () => {
  it("usa el viewport visual para que el layout se reduzca con el teclado", () => {
    expect(obtenerVariablesViewportVisible({ height: 576.4, offsetTop: 12.6 }, 800)).toEqual({
      altura: "576px",
      desplazamientoSuperior: "13px",
    });
  });

  it("usa la altura de ventana si VisualViewport no está disponible", () => {
    expect(obtenerVariablesViewportVisible(null, 800.4)).toEqual({
      altura: "800px",
      desplazamientoSuperior: "0px",
    });
  });
});
