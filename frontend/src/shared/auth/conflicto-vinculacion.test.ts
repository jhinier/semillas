import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import {
  consumirConflictoVinculacion,
  descartarConflictoVinculacion,
  publicarConflictoVinculacion,
} from "@/shared/auth/conflicto-vinculacion";

function instalarLocalStorageMock() {
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
  return storage;
}

function instalarWindowMock() {
  Object.defineProperty(globalThis, "window", {
    value: { dispatchEvent: () => undefined },
    configurable: true,
  });
}

describe("conflicto-vinculacion", () => {
  beforeEach(() => {
    instalarLocalStorageMock();
    instalarWindowMock();
    descartarConflictoVinculacion();
  });

  afterEach(() => {
    descartarConflictoVinculacion();
  });

  it("publica y entrega el mensaje una sola vez", () => {
    publicarConflictoVinculacion("El correo an***@gmail.com ya pertenece a otra cuenta");

    const primer = consumirConflictoVinculacion();
    const segundo = consumirConflictoVinculacion();

    expect(primer).toContain("an***@gmail.com");
    expect(segundo).toBeNull();
  });

  it("sobrescribe conflictos previos no consumidos", () => {
    publicarConflictoVinculacion("primero");
    publicarConflictoVinculacion("segundo");

    expect(consumirConflictoVinculacion()).toBe("segundo");
  });

  it("descarta mensajes sin consumirlos", () => {
    publicarConflictoVinculacion("algo");

    descartarConflictoVinculacion();

    expect(consumirConflictoVinculacion()).toBeNull();
  });
});
