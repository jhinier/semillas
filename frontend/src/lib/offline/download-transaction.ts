import { db, type MediaCache, type MediaCacheReference } from "./db";
import { construirRutaMediaOffline, type PaqueteOfflineRespuesta } from "./offline-package";

export const OFFLINE_MEDIA_STAGING_CACHE = "semillas-offline-media-staging-v1";
const OFFLINE_MEDIA_CACHE = "semillas-offline-media-v1";

function requestLocal(url: string): Request {
  return new Request(new URL(url, globalThis.location?.origin ?? "http://localhost").toString());
}

function validarRespuestaMedia(response: Response, medio: PaqueteOfflineRespuesta["medios"][number]): void {
  if (!response.ok && response.type !== "opaque") {
    throw new Error(`No se pudo descargar el recurso ${medio.id} (${response.status})`);
  }
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && medio.tamano_bytes !== null && medio.tamano_bytes > 0 && contentLength > medio.tamano_bytes * 2) {
    throw new Error(`El recurso ${medio.id} excede el tamaño declarado`);
  }
}

export function crearRegistrosMedia(paquete: PaqueteOfflineRespuesta, temaLocalId: string, ahora = Date.now()): MediaCache[] {
  return paquete.medios.map((medio) => ({
    serverId: medio.id,
    temaLocalId,
    tipo: medio.tipo,
    urlOriginal: medio.url_descarga,
    urlLocal: construirRutaMediaOffline(medio.id),
    textoAlternativo: medio.texto_alternativo,
    tipoMime: medio.tipo_mime,
    tamanoBytes: medio.tamano_bytes,
    duracionSeg: medio.duracion_seg,
    anchoPx: medio.ancho_px,
    altoPx: medio.alto_px,
    cachedAt: ahora,
    accessedAt: ahora,
  }));
}

export function crearReferenciasMedia(registros: MediaCache[], ahora = Date.now()): MediaCacheReference[] {
  return registros.flatMap((registro) => registro.temaLocalId ? [{
    serverId: registro.serverId,
    temaLocalId: registro.temaLocalId,
    createdAt: ahora,
  }] : []);
}

export function prepararMediosParaGuardar(registros: MediaCache[], existentes: MediaCache[]): MediaCache[] {
  const registrosUnicos = [...new Map(registros.map((registro) => [registro.serverId, registro])).values()];
  const existentesPorServerId = new Map(existentes.map((registro) => [registro.serverId, registro]));

  return registrosUnicos.map((registro) => ({
    ...registro,
    id: existentesPorServerId.get(registro.serverId)?.id,
  }));
}

export async function descargarMediosTransaccional(
  paquete: PaqueteOfflineRespuesta,
  temaLocalId: string,
  onProgress?: (progreso: number) => void,
  opciones?: { tolerarFallos?: boolean },
): Promise<MediaCache[]> {
  if (typeof caches === "undefined" || paquete.medios.length === 0) {
    onProgress?.(100);
    return [];
  }

  try {
    const estimate = await navigator.storage?.estimate?.();
    const cuota = Number(estimate?.quota ?? 0);
    const usado = Number(estimate?.usage ?? 0);
    if (cuota > 0 && usado + paquete.tamano_bytes > cuota) {
      throw new Error("No hay espacio suficiente para descargar este tema");
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("No hay espacio suficiente")) {
      throw err;
    }
  }

  const staging = await caches.open(OFFLINE_MEDIA_STAGING_CACHE);
  for (const request of await staging.keys()) await staging.delete(request);
  const todosRegistros = crearRegistrosMedia(paquete, temaLocalId);
  const idsDescargadosConExito = new Set<string>();

  try {
    for (const [indice, medio] of paquete.medios.entries()) {
      try {
        if (
          medio.url_descarga &&
          !medio.url_descarga.startsWith("privada://") &&
          !medio.url_descarga.startsWith("/media/")
        ) {
          const response = await fetch(medio.url_descarga, { mode: "cors", credentials: "omit" });
          validarRespuestaMedia(response, medio);
          await staging.put(requestLocal(construirRutaMediaOffline(medio.id)), response.clone());
          idsDescargadosConExito.add(medio.id);
        }
      } catch (error) {
        if (!opciones?.tolerarFallos) {
          throw error;
        }
        // Si un recurso multimedia remoto tiene URL rota o no responde, se omite sin abortar
        // la descarga del tema (la UI usa automáticamente la ilustración local empaquetada).
      }
      onProgress?.(paquete.medios.length === 0 ? 100 : Math.round(((indice + 1) / paquete.medios.length) * 100));
    }

    const principal = await caches.open(OFFLINE_MEDIA_CACHE);
    for (const medio of paquete.medios) {
      if (!idsDescargadosConExito.has(medio.id)) continue;
      const request = requestLocal(construirRutaMediaOffline(medio.id));
      const response = await staging.match(request);
      if (response) {
        await principal.put(request, response.clone());
      }
    }
    return todosRegistros.filter((r) => idsDescargadosConExito.has(r.serverId));
  } finally {
    for (const request of await staging.keys()) await staging.delete(request);
  }
}

export async function eliminarMediosPromovidosNoUsados(ids: string[], protegidos: ReadonlySet<string>): Promise<void> {
  if (typeof caches === "undefined") return;
  const principal = await caches.open(OFFLINE_MEDIA_CACHE);
  await Promise.all(ids.filter((id) => !protegidos.has(id)).map(async (id) => {
    const referencias = await db.mediaReferences.where("serverId").equals(id).count();
    if (referencias === 0) {
      await principal.delete(requestLocal(construirRutaMediaOffline(id)));
      await db.mediaCache.where("serverId").equals(id).delete();
    }
  }));
}

export async function registrarMediosDescargados(registros: MediaCache[]): Promise<void> {
  if (registros.length === 0) return;
  await db.transaction("rw", [db.mediaCache, db.mediaReferences], async () => {
    const ids = [...new Set(registros.map((registro) => registro.serverId))];
    const existentes = await db.mediaCache.where("serverId").anyOf(ids).toArray();
    const mediosParaGuardar = prepararMediosParaGuardar(registros, existentes);

    await db.mediaCache.bulkPut(mediosParaGuardar);
    const ahora = Date.now();
    await db.mediaReferences.bulkPut(crearReferenciasMedia(mediosParaGuardar, ahora));
  });
}
