import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test";

const perfilLocal = {
  localId: "perfil-local-1",
  serverId: "perfil-1",
  usuarioId: "usuario-1",
  usuarioRol: "usuario",
  usuarioProveedor: "correo",
  usuarioNombreVisible: "Semillero",
  usuarioCorreo: "semillero@example.com",
  apodo: "Semillero",
  grupoEdadId: "grupo-1",
  urlAvatar: null,
  claveAvatar: "1",
  prefiereAudio: false,
  tamanoTextoPreferido: "mediano",
  createdAt: "2026-07-13T00:00:00.000Z",
  updatedAt: "2026-07-13T00:00:00.000Z",
  syncStatus: "synced" as const,
  scopeId: "usuario:usuario-1",
};

const firstPerfil = mock(async () => perfilLocal);
const equalsScope = mock(() => ({ first: firstPerfil }));
const wherePerfil = mock(() => ({ equals: equalsScope }));

mock.module("@/lib/offline/db", () => ({
  db: {
    perfil: { where: wherePerfil },
  },
}));

mock.module("@/lib/offline/user-scope", () => ({
  obtenerScopeOffline: async () => "usuario:usuario-1",
}));

afterAll(() => {
  mock.restore();
});

beforeEach(() => {
  firstPerfil.mockClear();
  equalsScope.mockClear();
  wherePerfil.mockClear();
  Object.defineProperty(globalThis.navigator, "onLine", {
    configurable: true,
    value: false,
  });
});

describe("obtenerMiPerfil", () => {
  it("restaura el perfil persistido sin realizar una petición cuando no hay conexión", async () => {
    const { obtenerMiPerfil } = await import("./profile.api");

    const respuesta = await obtenerMiPerfil();

    expect(wherePerfil).toHaveBeenCalledWith("scopeId");
    expect(equalsScope).toHaveBeenCalledWith("usuario:usuario-1");
    expect(respuesta.perfil.apodo).toBe("Semillero");
    expect(respuesta.usuario.id).toBe("usuario-1");
  });
});
