import { describe, expect, it } from "bun:test";
import { puedeTransicionarReporte } from "./moderation-policy";

describe("policy de reportes", () => {
  it("permite revisión, resolución y descarte desde estados abiertos", () => {
    expect(puedeTransicionarReporte("abierto", "en_revision")).toBe(true);
    expect(puedeTransicionarReporte("en_revision", "resuelto")).toBe(true);
    expect(puedeTransicionarReporte("abierto", "descartado")).toBe(true);
  });

  it("deja estados finales sin transiciones", () => {
    expect(puedeTransicionarReporte("resuelto", "abierto")).toBe(false);
    expect(puedeTransicionarReporte("descartado", "resuelto")).toBe(false);
  });
});
