import { describe, expect, it } from "bun:test";

import { obtenerDatosCuentaTopbar } from "./app-topbar";

describe("obtenerDatosCuentaTopbar", () => {
  it("usa el apodo guardado y marca la sesión como invitado", () => {
    const cuenta = obtenerDatosCuentaTopbar(
      { apodo: "Mateo", url_avatar: null } as never,
      { proveedor: "invitado", correo: null, nombre_visible: "Semillero" } as never,
    );

    expect(cuenta.nombre).toBe("Mateo");
    expect(cuenta.nivelTexto).toBe("Invitado");
    expect(cuenta.avatarUrl).toBeTruthy();
  });

  it("usa el apodo y correo de la cuenta real", () => {
    const cuenta = obtenerDatosCuentaTopbar(
      { apodo: "Semillero", url_avatar: "1" } as never,
      { proveedor: "correo", correo: "admin@semillas.org", nombre_visible: "Semillero" } as never,
    );

    expect(cuenta.nombre).toBe("Semillero");
    expect(cuenta.nivelTexto).toBe("admin@semillas.org");
  });
});
