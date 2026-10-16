import { db } from "./db";
import { construirRutaMediaOffline, type PaqueteOfflineRespuesta } from "./offline-package";

export const OFFLINE_MEDIA_CACHE = "semillas-offline-media-v1";
const MEDIA_CACHE_NAME = OFFLINE_MEDIA_CACHE;

export type MedioDescargable = {
  id: string;
  tipo: "imagen" | "audio" | "video" | "archivo";
  url_descarga: string;
  texto_alternativo: string | null;
  tipo_mime: string | null;
  tamano_bytes: number | null;
  duracion_seg: number | null;
  ancho_px: number | null;
  alto_px: number | null;
};

export function obtenerUrlMediaLocal(serverId: string): string {
  return construirRutaMediaOffline(serverId);
}

function crearRequestLocal(urlLocal: string): Request {
  return new Request(new URL(urlLocal, globalThis.location?.origin ?? "http://localhost").toString());
}

export async function guardarMedioEnCache(medio: MedioDescargable, temaLocalId?: string) {
  const respuesta = await fetch(medio.url_descarga, { mode: "cors", credentials: "omit" });
  if (!respuesta.ok && respuesta.type !== "opaque") {
    throw new Error(`No se pudo descargar el recurso ${medio.id} (${respuesta.status})`);
  }

  const cache = await caches.open(MEDIA_CACHE_NAME);
  const urlLocal = obtenerUrlMediaLocal(medio.id);
  await cache.put(crearRequestLocal(urlLocal), respuesta.clone());
  await db.mediaCache.put({
    serverId: medio.id,
    temaLocalId,
    tipo: medio.tipo,
    urlOriginal: medio.url_descarga,
    urlLocal,
    textoAlternativo: medio.texto_alternativo,
    tipoMime: medio.tipo_mime,
    tamanoBytes: medio.tamano_bytes,
    duracionSeg: medio.duracion_seg,
    anchoPx: medio.ancho_px,
    altoPx: medio.alto_px,
    cachedAt: Date.now(),
    accessedAt: Date.now(),
  });
}

export async function eliminarMedioDeCache(serverId: string): Promise<void> {
  const cache = await caches.open(MEDIA_CACHE_NAME);
  await cache.delete(crearRequestLocal(obtenerUrlMediaLocal(serverId)));
  await db.mediaCache.where("serverId").equals(serverId).delete();
  await db.mediaReferences.where("serverId").equals(serverId).delete();
}

export async function existeMedioEnCache(serverId: string): Promise<boolean> {
  const cache = await caches.open(MEDIA_CACHE_NAME);
  return Boolean(await cache.match(crearRequestLocal(obtenerUrlMediaLocal(serverId))));
}

export async function obtenerUsoAlmacenamiento() {
  const estimate = await navigator.storage?.estimate?.();
  const usage = Number(estimate?.usage ?? 0);
  const quota = Number(estimate?.quota ?? 0);
  const persisted = (await navigator.storage?.persisted?.().catch(() => false)) ?? false;
  return { usageBytes: usage, quotaBytes: quota, percentage: quota > 0 ? Math.min(100, Math.round((usage / quota) * 100)) : 0, persisted };
}

export async function solicitarAlmacenamientoPersistente(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  return navigator.storage.persist();
}

export async function cachearMediosPaqueteOffline(
  paquete: PaqueteOfflineRespuesta,
  temaLocalId: string,
  onProgress?: (progreso: number) => void,
): Promise<void> {
  const cache = await caches.open(MEDIA_CACHE_NAME);
  const total = paquete.medios.length;

  for (const [indice, medio] of paquete.medios.entries()) {
    await guardarMedioEnCache(medio, temaLocalId);

    if (onProgress) {
      const avance = total === 0 ? 100 : Math.round(((indice + 1) / total) * 100);
      onProgress(avance);
    }
  }
}

export async function eliminarMediosTemaOffline(temaLocalId: string): Promise<void> {
  const cache = await caches.open(MEDIA_CACHE_NAME);
  const referencias = await db.mediaReferences.where("temaLocalId").equals(temaLocalId).toArray();
  await db.mediaReferences.where("temaLocalId").equals(temaLocalId).delete();

  await Promise.all(
    referencias.map(async (referencia) => {
      const restantes = await db.mediaReferences.where("serverId").equals(referencia.serverId).count();
      if (restantes === 0) {
        await cache.delete(crearRequestLocal(obtenerUrlMediaLocal(referencia.serverId)));
        await db.mediaCache.where("serverId").equals(referencia.serverId).delete();
      }
    }),
  );
}

export async function obtenerMedioCacheado(serverId: string): Promise<Response | undefined> {
  const cache = await caches.open(MEDIA_CACHE_NAME);
  const request = crearRequestLocal(construirRutaMediaOffline(serverId));
  const response = await cache.match(request);
  if (!response) return undefined;

  const registro = await db.mediaCache.where("serverId").equals(serverId).first();
  if (registro?.id) {
    await db.mediaCache.update(registro.id, { accessedAt: Date.now() });
  }

  return response;
}
