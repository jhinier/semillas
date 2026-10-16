import { describe, expect, it } from "bun:test";

import { OPCIONES_CUENTA } from "./app-account-menu";

describe("AppAccountMenu", () => {
  it("expone las opciones secundarias esperadas", () => {
    expect(OPCIONES_CUENTA.map((opcion) => opcion.label)).toEqual([
      "Mi perfil",
      "Preferencias",
      "Mis insignias",
      "Descargas",
      "Sincronización",
    ]);
  });

  it("asigna iconos lucide-react por opcion", () => {
    for (const opcion of OPCIONES_CUENTA) {
      expect(typeof opcion.Icono).toBe("object");
      expect((opcion.Icono as { displayName?: string }).displayName).toBeDefined();
    }
  });

  it("no depende de clases CSS de Font Awesome", () => {
    for (const opcion of OPCIONES_CUENTA) {
      expect(typeof opcion.Icono).not.toBe("string");
    }
  });
});
