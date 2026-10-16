import { describe, expect, it } from "bun:test";
import { puedePublicar, validarTransicionEditorial } from "./editorial-policy";

describe("policy editorial", () => {
  it("permite el flujo humano y rechazo a borrador", () => {
    expect(() => validarTransicionEditorial("borrador", "revision")).not.toThrow();
    expect(() => validarTransicionEditorial("revision", "aprobado")).not.toThrow();
    expect(() => validarTransicionEditorial("revision", "borrador")).not.toThrow();
    expect(() => validarTransicionEditorial("aprobado", "publicado")).not.toThrow();
  });

  it("bloquea publicar desde estados no aprobados", () => {
    expect(() => validarTransicionEditorial("borrador", "publicado")).toThrow();
    expect(puedePublicar("aprobado", true)).toBe(true);
    expect(puedePublicar("aprobado", false)).toBe(false);
  });
});
