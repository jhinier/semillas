import { describe, expect, it } from "bun:test";
import { claveCacheScope } from "./scoped-cache";

describe("claveCacheScope", () => {
  it("separa la cache por identidad", () => {
    expect(claveCacheScope("semillas:gamificacion", "usuario:a")).toBe("semillas:gamificacion:usuario:a");
    expect(claveCacheScope("semillas:gamificacion", "usuario:b")).not.toBe(
      claveCacheScope("semillas:gamificacion", "usuario:a"),
    );
  });

  it("no crea cache privada sin scope", () => {
    expect(claveCacheScope("semillas:progreso", null)).toBeNull();
  });
});
