import { describe, expect, it, mock } from "bun:test";

const toastErrorMock = mock(() => undefined);

mock.module("sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: () => undefined,
  },
}));

const { resolverRedireccionAuthCallback } = await import("./auth.callback");

describe("resolverRedireccionAuthCallback", () => {
  it("notifica el error y redirige al login cuando falla la sesión", async () => {
    const navegarMock = mock(() => undefined);
    const sincronizarSesionAutenticadaMock = mock(async () => {
      throw new Error("Sesión vencida");
    });
    const obtenerMiPerfilMock = mock(async () => ({
      perfil: null,
      usuario: null,
    })) as never;

    await resolverRedireccionAuthCallback({
      estaActivo: () => true,
      navegar: navegarMock,
      sincronizarSesionAutenticada: sincronizarSesionAutenticadaMock,
      obtenerMiPerfil: obtenerMiPerfilMock,
    });

    expect(toastErrorMock).toHaveBeenCalledTimes(1);
    expect(navegarMock).toHaveBeenCalledWith({
      to: "/login",
      search: { redirect: "/app" },
      replace: true,
    });
    expect(obtenerMiPerfilMock).not.toHaveBeenCalled();
  });
});
