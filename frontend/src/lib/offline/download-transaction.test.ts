import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { crearReferenciasMedia, crearRegistrosMedia, descargarMediosTransaccional, prepararMediosParaGuardar, OFFLINE_MEDIA_STAGING_CACHE } from "./download-transaction";
import type { PaqueteOfflineRespuesta } from "./offline-package";

const paquete = {
  paquete_id: "p1", tamano_bytes: 12, schema_version: 1, generado_en: "2026-07-13T00:00:00.000Z", grupo_edad_id: "g1",
  tema: { id: "t1", senda_id: "s1", titulo: "Tema", slug: "tema", objetivo: "O", resumen: null, portada_recurso_id: null, estado: "publicado", version_biblica_id: null, xp_recompensa: 1, minutos_estimados: 1, version_contenido: 1, publicado_en: null, creado_en: null, actualizado_en: null },
  pasos: [], actividades: [], medios: [{ id: "m1", tipo: "audio", titulo: null, url_descarga: "https://example.com/a.mp3", texto_alternativo: "Audio", tipo_mime: "audio/mpeg", tamano_bytes: 12, duracion_seg: 1, ancho_px: null, alto_px: null }],
} satisfies PaqueteOfflineRespuesta;

type CacheFake = {
  entries: Map<string, Response>;
  keys: () => Promise<Request[]>;
  delete: (request: Request) => Promise<boolean>;
  put: (request: Request, response: Response) => Promise<void>;
  match: (request: Request) => Promise<Response | undefined>;
};

const cachesOriginal = globalThis.caches;
const fetchOriginal = globalThis.fetch;
const navigatorOriginal = globalThis.navigator;
let stores: Map<string, CacheFake>;

function crearCache(): CacheFake {
  const entries = new Map<string, Response>();
  return {
    entries,
    keys: async () => [...entries.keys()].map((key) => new Request(key)),
    delete: async (request) => entries.delete(request.url),
    put: async (request, response) => { entries.set(request.url, response); },
    match: async (request) => entries.get(request.url),
  };
}

beforeEach(() => {
  stores = new Map();
  Object.defineProperty(globalThis, "caches", {
    configurable: true,
    value: { open: async (name: string) => {
      const existente = stores.get(name);
      if (existente) return existente;
      const cache = crearCache();
      stores.set(name, cache);
      return cache;
    } },
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { storage: { estimate: async () => ({ quota: 10_000, usage: 0 }) } },
  });
});

afterEach(() => {
  Object.defineProperty(globalThis, "caches", { configurable: true, value: cachesOriginal });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: navigatorOriginal });
  Object.defineProperty(globalThis, "fetch", { configurable: true, value: fetchOriginal });
});

describe("descarga media transaccional", () => {
  it("prepara registros sin marcar el tema como completo", () => {
    const [registro] = crearRegistrosMedia(paquete, "local-theme", 10);
    expect(registro).toMatchObject({ serverId: "m1", temaLocalId: "local-theme", cachedAt: 10 });
  });

  it("mantiene referencias independientes cuando dos temas comparten media", () => {
    const temaA = crearRegistrosMedia(paquete, "local-theme-a", 10);
    const temaB = crearRegistrosMedia(paquete, "local-theme-b", 20);
    expect(crearReferenciasMedia([...temaA, ...temaB], 30)).toEqual([
      { serverId: "m1", temaLocalId: "local-theme-a", createdAt: 30 },
      { serverId: "m1", temaLocalId: "local-theme-b", createdAt: 30 },
    ]);
  });

  it("reutiliza el registro local cuando un medio ya existe", () => {
    const registro = crearRegistrosMedia(paquete, "local-theme", 10)[0]!;
    const preparados = prepararMediosParaGuardar(
      [registro, { ...registro, temaLocalId: "local-theme" }],
      [{ ...registro, id: 42, temaLocalId: "otro-tema" }],
    );

    expect(preparados).toHaveLength(1);
    expect(preparados[0]).toMatchObject({ id: 42, serverId: "m1", temaLocalId: "local-theme" });
  });

  it("limpia staging y no promueve parcialmente si falla un recurso", async () => {
    const paqueteConDosMedios = {
      ...paquete,
      medios: [
        paquete.medios[0]!,
        { ...paquete.medios[0]!, id: "m2", url_descarga: "https://example.com/falla.mp3" },
      ],
      tamano_bytes: 24,
    } satisfies PaqueteOfflineRespuesta;
    const fetchStub = async (url: URL | RequestInfo) => {
      if (url.toString().includes("falla")) throw new Error("red caída");
      return new Response("audio", { status: 200, headers: { "content-type": "audio/mpeg", "content-length": "5" } });
    };
    Object.defineProperty(globalThis, "fetch", { configurable: true, value: fetchStub });

    await expect(descargarMediosTransaccional(paqueteConDosMedios, "local-theme")).rejects.toThrow("red caída");
    expect(stores.get(OFFLINE_MEDIA_STAGING_CACHE)?.entries.size ?? 0).toBe(0);
    expect(stores.get("semillas-offline-media-v1")?.entries.size ?? 0).toBe(0);
  });
});
