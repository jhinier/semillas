import { describe, expect, it } from "bun:test";
import { normalizarNombreInsignia } from "./crear-tarjeta-insignia.utils";

describe("tarjeta de insignia", () => {
  it("genera un nombre de archivo seguro y sin PII", () => {
    expect(normalizarNombreInsignia("¡Mi primera insignia! 2026")).toBe("mi-primera-insignia-2026");
    expect(normalizarNombreInsignia("  Luz / Esperanza  ")).toBe("luz-esperanza");
  });
});
