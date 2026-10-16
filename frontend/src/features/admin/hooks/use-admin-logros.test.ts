import { afterEach, beforeAll, beforeEach, describe, expect, it } from "bun:test";

let suscribirConectividadLogros: typeof import("./use-admin-logros")["suscribirConectividadLogros"];

const descriptorWindowOriginal = Object.getOwnPropertyDescriptor(globalThis, "window");

beforeAll(async () => {
  process.env.VITE_API_URL = "http://localhost";
  process.env.VITE_SUPABASE_URL = "http://localhost";
  process.env.VITE_SUPABASE_ANON_KEY = "clave-de-prueba";
  ({ suscribirConectividadLogros } = await import("./use-admin-logros"));
});

beforeEach(() => {
  const oyentes = new Map<string, EventListener>();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      addEventListener: (evento: string, oyente: EventListener) => oyentes.set(evento, oyente),
      removeEventListener: (evento: string) => oyentes.delete(evento),
      despachar: (evento: string) => oyentes.get(evento)?.(new Event(evento)),
    },
  });
});

afterEach(() => {
  if (descriptorWindowOriginal) {
    Object.defineProperty(globalThis, "window", descriptorWindowOriginal);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
});

describe("suscribirConectividadLogros", () => {
  it("elimina queries de logros y desactiva resultados al quedar offline", () => {
    const eliminadas: unknown[] = [];
    const estados: boolean[] = [];
    const cliente = { removeQueries: (filtros: unknown) => eliminadas.push(filtros) };
    const ventana = globalThis.window as unknown as { despachar: (evento: string) => void };

    const limpiar = suscribirConectividadLogros(cliente, (conectado) => estados.push(conectado));
    ventana.despachar("offline");
    limpiar();
    ventana.despachar("online");

    expect(eliminadas).toEqual([{ queryKey: ["admin", "logros"] }]);
    expect(estados).toEqual([false]);
  });
});