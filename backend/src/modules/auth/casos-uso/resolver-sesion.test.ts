import { describe, expect, it } from "bun:test";
import type { AuthSessionUser } from "../../../config/env";
import { crearCasoResolverSesion } from "./resolver-sesion";

const authUser: AuthSessionUser = {
  id: "auth-1",
  displayName: "Semillero",
  email: "semillero@example.com",
  provider: "google",
};

describe("resolver sesión", () => {
  it("devuelve una cuenta OAuth existente", async () => {
    const resolver = crearCasoResolverSesion({
      buscarUsuarioPorIdExterno: async () => ({ id: "app-1", rol: "usuario", proveedor: "google", nombre_visible: "Semillero", correo: authUser.email, activo: true }),
      crearUsuarioApp: async () => { throw new Error("no debe crear"); },
      crearPerfil: async () => undefined,
      eliminarUsuarioApp: async () => undefined,
    });

    await expect(resolver(authUser)).resolves.toMatchObject({ id: "app-1", role: "usuario" });
  });

  it("crea cuenta y perfil para OAuth nuevo", async () => {
    const operaciones: string[] = [];
    const resolver = crearCasoResolverSesion({
      buscarUsuarioPorIdExterno: async () => null,
      crearUsuarioApp: async () => { operaciones.push("usuario"); return { id: "app-2", rol: "usuario", proveedor: "google", nombre_visible: "Semillero", correo: authUser.email, activo: true }; },
      crearPerfil: async () => { operaciones.push("perfil"); },
      eliminarUsuarioApp: async () => { operaciones.push("rollback"); },
    });

    await resolver(authUser);
    expect(operaciones).toEqual(["usuario", "perfil"]);
  });

  it("rechaza una cuenta OAuth inactiva", async () => {
    const resolver = crearCasoResolverSesion({
      buscarUsuarioPorIdExterno: async () => ({ id: "app-blocked", rol: "usuario", proveedor: "google", nombre_visible: "Bloqueado", correo: authUser.email, activo: false }),
      crearUsuarioApp: async () => { throw new Error("no debe crear"); },
      crearPerfil: async () => undefined,
      eliminarUsuarioApp: async () => undefined,
    });

    await expect(resolver(authUser)).rejects.toMatchObject({ status: 401, code: "UNAUTHORIZED" });
  });

  it("revierte la cuenta si falla la creación del perfil", async () => {
    let eliminado = false;
    const resolver = crearCasoResolverSesion({
      buscarUsuarioPorIdExterno: async () => null,
      crearUsuarioApp: async () => ({ id: "app-3", rol: "usuario", proveedor: "google", nombre_visible: "Semillero", correo: authUser.email, activo: true }),
      crearPerfil: async () => { throw new Error("perfil inválido"); },
      eliminarUsuarioApp: async () => { eliminado = true; },
    });

    await expect(resolver(authUser)).rejects.toThrow("perfil inválido");
    expect(eliminado).toBe(true);
  });
});
