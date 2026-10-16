export type MediaAssetType = "imagen" | "audio" | "video" | "documento";
export type MediaTypeFilter = "" | MediaAssetType;
export type MediaViewMode = "grid" | "list";
export type MediaUsageFilter = "todos" | "usados" | "sin_uso" | "accesibilidad";

export type MediaCardItem = {
  id: string;
  nombre: string;
  tipo: MediaAssetType;
  tipoLabel: string;
  imgUrl: string;
  usadoEnCount: number | null;
  subidoPor: string | null;
  fechaSubido: string;
  fechaTimestamp: number;
  fechaActualizado: string;
  tamano: string;
  tamanoBytes: number | null;
  formato: string;
  tipoMime: string | null;
  resolucion: string;
  dimensiones: string;
  anchoPx: number | null;
  altoPx: number | null;
  duracionSeg: number | null;
  altText: string | null;
};
