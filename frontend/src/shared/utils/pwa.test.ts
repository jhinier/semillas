import { afterEach, describe, expect, it } from "bun:test";
import { estaInstaladaComoPWA } from "./pwa";

const ventanaOriginal = globalThis.window;

function restaurarVentana() {
  if (ventanaOriginal) {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: ventanaOriginal,
    });
    return;
  }

  Reflect.deleteProperty(globalThis, "window");
}

afterEach(restaurarVentana);

describe("estaInstaladaComoPWA", () => {
  it("es segura cuando se ejecuta fuera del navegador", () => {
    Reflect.deleteProperty(globalThis, "window");

    expect(estaInstaladaComoPWA()).toBe(false);
  });

  it("reconoce los modos standalone y fullscreen", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        matchMedia: (query: string) => ({ matches: query === "(display-mode: standalone)" }),
        navigator: { standalone: false },
      },
    });

    expect(estaInstaladaComoPWA()).toBe(true);
  });

  it("reconoce la instalación standalone de Safari en iOS", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        matchMedia: () => ({ matches: false }),
        navigator: { standalone: true },
      },
    });

    expect(estaInstaladaComoPWA()).toBe(true);
  });
});
