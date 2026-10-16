import { describe, expect, it } from "bun:test";

import { resolverAccesoAdmin } from "./admin-access";

describe("resolverAccesoAdmin", () => {
  it("permite acceso cuando el usuario es administrador", () => {
    expect(resolverAccesoAdmin({ rol: "administrador" })).toEqual({ permitido: true });
  });

  it("redirige a login cuando no hay usuario autenticado", () => {
    expect(resolverAccesoAdmin(null)).toEqual({ permitido: false, redireccion: "/login" });
  });

  it("redirige al app cuando el usuario autenticado no es administrador", () => {
    expect(resolverAccesoAdmin({ rol: "usuario" })).toEqual({ permitido: false, redireccion: "/app" });
  });
});
