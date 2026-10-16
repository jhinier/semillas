import { describe, expect, it, mock } from "bun:test";

const toastErrorMock = mock(() => undefined);
const compartirMock = mock(async () => {
  throw new Error("share falló");
});
const crearTarjetaMock = mock(async () => new File(["x"], "insignia.png", { type: "image/png" }));
const descargarTarjetaMock = mock(() => undefined);

mock.module("sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: () => undefined,
    info: () => undefined,
  },
}));

mock.module("canvas-confetti", () => ({
  default: () => undefined,
}));

mock.module("../../logros/utils/crear-tarjeta-insignia", () => ({
  crearTarjetaInsignia: crearTarjetaMock,
  descargarTarjetaInsignia: descargarTarjetaMock,
}));

const { compartirConImagen } = await import("./modal-celebracion");

describe("compartirConImagen", () => {
  it("muestra un toast si falla el compartir nativo", async () => {
    Object.defineProperty(globalThis, "window", {
      value: {
        location: { href: "https://semillas.test/app" },
        open: () => undefined,
      },
      configurable: true,
    });

    Object.defineProperty(globalThis, "navigator", {
      value: {
        share: compartirMock,
        canShare: () => true,
      },
      configurable: true,
    });

    const resultado = await compartirConImagen("native", "Luz", 25, "https://img.test/insignia.png");

    expect(resultado).toBe(false);
    expect(crearTarjetaMock).toHaveBeenCalledTimes(1);
    expect(compartirMock).toHaveBeenCalledTimes(2);
    expect(toastErrorMock).toHaveBeenCalledTimes(1);
    expect(descargarTarjetaMock).not.toHaveBeenCalled();
  });
});
