import { afterEach, beforeAll, beforeEach, describe, expect, it } from "bun:test";

let suscribirConectividadAdmin: typeof import("./use-admin-clubes")["suscribirConectividadAdmin"];

const descriptorWindowOriginal = Object.getOwnPropertyDescriptor(globalThis, "window");

beforeAll(async () => {
  process.env.VITE_API_URL = "http://localhost";
  process.env.VITE_SUPABASE_URL = "http://localhost";
  process.env.VITE_SUPABASE_ANON_KEY = "clave-de-prueba";
  ({ suscribirConectividadAdmin } = await import("./use-admin-clubes"));
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

describe("suscribirConectividadAdmin", () => {
  it("elimina queries administrativas y desactiva resultados al quedar offline", () => {
    const eliminadas: unknown[] = [];
    const estados: boolean[] = [];
    const cliente = { removeQueries: (filtros: unknown) => eliminadas.push(filtros) };
    const ventana = globalThis.window as unknown as { despachar: (evento: string) => void };

    const limpiar = suscribirConectividadAdmin(cliente, (conectado) => estados.push(conectado));
    ventana.despachar("offline");
    limpiar();
    ventana.despachar("online");

    expect(eliminadas).toEqual([{ queryKey: ["admin", "clubes"] }]);
    expect(estados).toEqual([false]);
  });
});
