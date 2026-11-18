import { afterEach, describe, expect, it } from "bun:test";
import {
  guardarPreferenciaPerfil,
  leerPreferenciaPerfil,
  normalizarTamanoTexto,
} from "./preferences";

let descriptorWindowPrevio: PropertyDescriptor | undefined;
let windowReemplazada = false;

afterEach(() => {
  if (!windowReemplazada) return;
  if (descriptorWindowPrevio) {
    Object.defineProperty(globalThis, "window", descriptorWindowPrevio);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
  descriptorWindowPrevio = undefined;
  windowReemplazada = false;
});

describe("preferencias de accesibilidad", () => {
  it("normaliza la variante acentuada y valores desconocidos", () => {
    expect(normalizarTamanoTexto("pequeño")).toBe("pequeno");
    expect(normalizarTamanoTexto("otro")).toBe("mediano");
  });

  it("aísla preferencias por cuenta sin sobrescribir ni heredar claves globales", () => {
    descriptorWindowPrevio = Object.getOwnPropertyDescriptor(globalThis, "window");
    windowReemplazada = true;
    const store = new Map<string, string>();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      writable: true,
      value: {
        localStorage: {
          getItem: (key: string) => store.get(key) ?? null,
          setItem: (key: string, value: string) => {
            store.set(key, value);
          },
          removeItem: (key: string) => {
            store.delete(key);
          },
        },
        dispatchEvent: () => true,
      },
    });

    store.set("semillas-pref-contraste", "alto");
    expect(leerPreferenciaPerfil("semillas-pref-contraste", "admin-1", "normal")).toBe("normal");

    guardarPreferenciaPerfil("semillas-pref-contraste", "alto", "student-1");
    expect(leerPreferenciaPerfil("semillas-pref-contraste", "student-1", "normal")).toBe("alto");
    expect(leerPreferenciaPerfil("semillas-pref-contraste", "admin-1", "normal")).toBe("normal");

    guardarPreferenciaPerfil("semillas-pref-tema", "oscuro", "student-1");
    expect(store.get("semillas-pref-tema")).toBeUndefined();
    expect(leerPreferenciaPerfil("semillas-pref-tema", "admin-1", "claro")).toBe("claro");
  });
});
