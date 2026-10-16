import { describe, expect, it, mock } from "bun:test";

import { notificarFalloSincronizacion } from "./syncEngine";

describe("notificarFalloSincronizacion", () => {
  it("emite un evento visible para la UI", () => {
    const ventana = new EventTarget();
    Object.defineProperty(globalThis, "window", {
      value: ventana,
      configurable: true,
    });

    const listener = mock((event: Event) => event);
    window.addEventListener("semillas:sync-error", listener as EventListener);

    notificarFalloSincronizacion("Sincronización fallida");

    expect(listener).toHaveBeenCalledTimes(1);
    const evento = listener.mock.calls[0]?.[0] as CustomEvent<{ mensaje: string }>;
    expect(evento.detail).toEqual({ mensaje: "Sincronización fallida" });

    window.removeEventListener("semillas:sync-error", listener as EventListener);
  });
});
