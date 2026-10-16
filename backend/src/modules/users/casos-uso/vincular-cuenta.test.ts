import { describe, expect, it } from "bun:test";
import { ErrorConflicto, ErrorNoAutorizado } from "../../../shared/errores/error-aplicacion";
import { crearCasoVincularCuenta } from "./vincular-cuenta";

const usuarioInvitado = {
  id: "invitado-1",
  provider: "invitado",
  displayName: "Semillero",
  email: null,
};

const sesionGoogle = {
  id: "auth-1",
  provider: "google" as const,
  displayName: "Semillero Google",
  email: "semillero@example.com",
};

function crearUsuarios(overrides: Partial<Parameters<typeof crearCasoVincularCuenta>[0]["usuarios"]> = {}) {
  return {
    vincularCuenta: async () => ({ id: "invitado-1", proveedor: "google", correo: "semillero@example.com" }),
    obtenerPerfilPorUsuarioId: async () => ({ id: "perfil-1", apodo: "Semillero" }),
    ...overrides,
  } as unknown as Parameters<typeof crearCasoVincularCuenta>[0]["usuarios"];
}

describe("caso de uso vincular cuenta", () => {
  it("conserva el usuario invitado y devuelve su perfil tras vincular", async () => {
    const vincular = crearCasoVincularCuenta({ usuarios: crearUsuarios() });
    const resultado = await vincular(usuarioInvitado, sesionGoogle);

    expect(resultado.usuario.id).toBe("invitado-1");
    expect(resultado.perfil?.id).toBe("perfil-1");
  });

  it("rechaza vincular una cuenta que ya no es invitada", async () => {
    const vincular = crearCasoVincularCuenta({ usuarios: crearUsuarios() });

    await expect(vincular({ ...usuarioInvitado, provider: "google" }, sesionGoogle))
      .rejects.toBeInstanceOf(ErrorConflicto);
  });

  it("rechaza vincular sin sesión externa", async () => {
    const vincular = crearCasoVincularCuenta({ usuarios: crearUsuarios() });

    await expect(vincular(usuarioInvitado, undefined)).rejects.toBeInstanceOf(ErrorNoAutorizado);
  });

  it("propaga el conflicto de identidad del repositorio", async () => {
    const vincular = crearCasoVincularCuenta({
      usuarios: crearUsuarios({ vincularCuenta: async () => { throw new ErrorConflicto("cuenta duplicada"); } }),
    });

    await expect(vincular(usuarioInvitado, sesionGoogle)).rejects.toThrow("cuenta duplicada");
  });

  it("conserva el UUID y las relaciones al delegar la vinculación", async () => {
    let usuarioIdRecibido: string | undefined;
    const vincular = crearCasoVincularCuenta({
      usuarios: crearUsuarios({
        vincularCuenta: async (datos) => {
          usuarioIdRecibido = datos.usuarioId;
          return { id: datos.usuarioId, rol: "usuario", proveedor: "google", nombre_visible: "Semillero", correo: "semillero@example.com" };
        },
      }),
    });

    await vincular(usuarioInvitado, sesionGoogle);
    expect(usuarioIdRecibido).toBe(usuarioInvitado.id);
  });

  it("mantiene el conflicto en reintentos concurrentes", async () => {
    let vinculada = false;
    const vincular = crearCasoVincularCuenta({
      usuarios: crearUsuarios({
        vincularCuenta: async (datos) => {
          await Promise.resolve();
          if (vinculada) throw new ErrorConflicto("cuenta ya vinculada");
          vinculada = true;
          return { id: datos.usuarioId, rol: "usuario", proveedor: "google", nombre_visible: "Semillero", correo: "semillero@example.com" };
        },
      }),
    });

    const resultados = await Promise.allSettled([
      vincular(usuarioInvitado, sesionGoogle),
      vincular(usuarioInvitado, sesionGoogle),
    ]);
    expect(resultados.filter((resultado) => resultado.status === "fulfilled")).toHaveLength(1);
    expect(resultados.filter((resultado) => resultado.status === "rejected")).toHaveLength(1);
  });
});
