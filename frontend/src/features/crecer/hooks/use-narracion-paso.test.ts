import { describe, expect, it } from "bun:test";
import { cargarSrcNarracion, resolverSrcNarracion } from "./narracion-utils";

describe("narración por paso", () => {
  it("prioriza la URL firmada y usa la ruta offline como fallback", () => {
    expect(resolverSrcNarracion("audio-1", "https://media.example/audio.mp3")).toBe("https://media.example/audio.mp3");
    expect(resolverSrcNarracion("audio-1")).toBe("/__offline_media/audio-1");
  });

  it("no crea recurso para un paso sin audio", () => {
    expect(resolverSrcNarracion(null)).toBeNull();
  });

  it("usa el audio cacheado aunque no haya conexión", async () => {
    const resultado = await cargarSrcNarracion("audio-1", {
      obtenerCache: async () => ({ blob: async () => new Blob(["audio"]) }),
      obtenerUrlFirmada: async () => ({ url: "https://no-debe-usarse" }),
      online: false,
      crearObjectUrl: () => "blob:audio-1",
    });
    expect(resultado).toEqual({ src: "blob:audio-1", esObjectUrl: true });
  });

  it("renueva la URL online cuando no existe cache", async () => {
    const resultado = await cargarSrcNarracion("audio-1", {
      obtenerCache: async () => null,
      obtenerUrlFirmada: async () => ({ url: "https://media.example/audio.mp3" }),
      online: true,
    });
    expect(resultado).toEqual({ src: "https://media.example/audio.mp3", esObjectUrl: false });
  });

  it("falla de forma explícita offline sin cache", async () => {
    await expect(cargarSrcNarracion("audio-1", {
      obtenerCache: async () => null,
      obtenerUrlFirmada: async () => ({ url: "https://no-debe-usarse" }),
      online: false,
    })).rejects.toThrow("Audio no disponible sin conexión");
  });
});
