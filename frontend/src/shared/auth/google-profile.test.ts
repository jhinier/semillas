import { beforeEach, describe, expect, it } from "bun:test";

import { limpiarNombreSugeridoDeGoogle, leerNombreSugeridoDeGoogle, guardarNombreSugeridoDeGoogle } from "./google-profile";

beforeEach(() => {
  const storage = new Map<string, string>();

  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => storage.clear(),
    },
    configurable: true,
  });
});

describe("google profile suggestion", () => {
  it("guarda el nombre sugerido cuando la sesión viene de Google", () => {
    guardarNombreSugeridoDeGoogle({
      user: {
        app_metadata: { provider: "google" },
        user_metadata: { full_name: "Ana Maria" },
        email: "ana@example.com",
      },
    } as never);

    expect(leerNombreSugeridoDeGoogle()).toBe("Ana Maria");
  });

  it("usa el correo si Google no envía nombre", () => {
    guardarNombreSugeridoDeGoogle({
      user: {
        app_metadata: { provider: "google" },
        user_metadata: {},
        email: "ana@example.com",
      },
    } as never);

    expect(leerNombreSugeridoDeGoogle()).toBe("ana");
  });

  it("limpia el nombre sugerido si la sesión no viene de Google", () => {
    guardarNombreSugeridoDeGoogle({
      user: {
        app_metadata: { provider: "google" },
        user_metadata: { full_name: "Ana Maria" },
        email: "ana@example.com",
      },
    } as never);

    limpiarNombreSugeridoDeGoogle();

    expect(leerNombreSugeridoDeGoogle()).toBe("");
  });
});
