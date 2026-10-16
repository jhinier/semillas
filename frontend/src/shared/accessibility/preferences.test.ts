import { describe, expect, it } from "bun:test";
import { normalizarTamanoTexto } from "./preferences";

describe("preferencias de accesibilidad", () => {
  it("normaliza la variante acentuada y valores desconocidos", () => {
    expect(normalizarTamanoTexto("pequeño")).toBe("pequeno");
    expect(normalizarTamanoTexto("otro")).toBe("mediano");
  });
});
