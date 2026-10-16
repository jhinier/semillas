import { describe, expect, it } from "bun:test";

import { OPCIONES_CUENTA_MOVIL } from "./app-account-menu-mobile";

describe("AppAccountMenuMobile", () => {
  it("expone las opciones secundarias esperadas", () => {
    expect(OPCIONES_CUENTA_MOVIL.map((opcion) => opcion.label)).toEqual([
      "Mi perfil",
      "Preferencias",
      "Mis insignias",
      "Descargas",
      "Sincronización",
      "Cerrar sesión",
    ]);
  });

  it("incluye un Icono de lucide-react por opcion", () => {
    for (const opcion of OPCIONES_CUENTA_MOVIL) {
      expect(typeof opcion.Icono).toBe("object");
      expect((opcion.Icono as { displayName?: string }).displayName).toBeDefined();
    }
  });

  it("no depende de clases CSS de Font Awesome", () => {
    for (const opcion of OPCIONES_CUENTA_MOVIL) {
      expect(typeof opcion.Icono).not.toBe("string");
    }
  });
});
