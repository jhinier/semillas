export function resolverSrcNarracion(recursoId: string | null | undefined, urlFirmada?: string | null): string | null {
  return recursoId ? urlFirmada ?? `/__offline_media/${recursoId}` : null;
}

export type DependenciasNarracion = {
  obtenerCache: (recursoId: string) => Promise<{ blob: () => Promise<Blob> } | null | undefined>;
  obtenerUrlFirmada: (recursoId: string) => Promise<{ url: string }>;
  online: boolean;
  crearObjectUrl?: (blob: Blob) => string;
};

export async function cargarSrcNarracion(recursoId: string, dependencias: DependenciasNarracion): Promise<{ src: string; esObjectUrl: boolean }> {
  const local = await dependencias.obtenerCache(recursoId);
  if (local) {
    const crearObjectUrl = dependencias.crearObjectUrl ?? ((blob: Blob) => URL.createObjectURL(blob));
    return { src: crearObjectUrl(await local.blob()), esObjectUrl: true };
  }
  if (!dependencias.online) throw new Error("Audio no disponible sin conexión");
  const firmado = await dependencias.obtenerUrlFirmada(recursoId);
  const src = resolverSrcNarracion(recursoId, firmado.url);
  if (!src) throw new Error("Audio no disponible");
  return { src, esObjectUrl: false };
}
