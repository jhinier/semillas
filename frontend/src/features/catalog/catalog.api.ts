import { peticion } from "../../shared/api/api";
import type { GrupoEdad } from "../../shared/api/api";

const CACHE_GRUPOS_EDAD_KEY = "semillas_grupos_edad_cache_v1";

export const GRUPOS_EDAD_OFFLINE: GrupoEdad[] = [
  {
    id: "semillas",
    codigo: "semillas",
    nombre: "Semillas",
    edad_minima: 5,
    edad_maxima: 8,
    descripcion: "Descubre a Dios con historias y actividades sencillas.",
    imagen_url: null,
    orden: 1,
  },
  {
    id: "exploradores",
    codigo: "exploradores",
    nombre: "Exploradores",
    edad_minima: 9,
    edad_maxima: 12,
    descripcion: "Aprende más de Dios y entiende su Palabra.",
    imagen_url: null,
    orden: 2,
  },
  {
    id: "embajadores",
    codigo: "embajadores",
    nombre: "Embajadores",
    edad_minima: 13,
    edad_maxima: 17,
    descripcion: "Profundiza tu fe y vive con propósito.",
    imagen_url: null,
    orden: 3,
  },
];

function leerCacheGruposEdad(): GrupoEdad[] | null {
  try {
    const raw = localStorage.getItem(CACHE_GRUPOS_EDAD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GrupoEdad[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export async function obtenerGruposEdad(): Promise<GrupoEdad[]> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return leerCacheGruposEdad() ?? GRUPOS_EDAD_OFFLINE;
  }

  try {
    const grupos = await peticion<GrupoEdad[]>("/catalogo/grupos-etarios", {
      autenticar: false,
    });
    try {
      localStorage.setItem(CACHE_GRUPOS_EDAD_KEY, JSON.stringify(grupos));
    } catch {
      // ignorar
    }
    return grupos;
  } catch {
    return leerCacheGruposEdad() ?? GRUPOS_EDAD_OFFLINE;
  }
}

export function obtenerVersionesBiblicas() {
  return peticion<
    Array<{ id: string; codigo: string; nombre: string; dominio_publico: boolean }>
  >("/catalogo/versiones-biblicas", { autenticar: false });
}

export function obtenerPasosCrecer() {
  return peticion<
    Array<{
      id: string;
      codigo: string;
      nombre: string;
      descripcion: string | null;
      orden: number;
      color_hex: string | null;
    }>
  >("/catalogo/pasos-crecer", { autenticar: false });
}

export function obtenerTiposActividad() {
  return peticion<
    Array<{
      id: string;
      codigo: string;
      nombre: string;
      descripcion: string | null;
      es_juego: boolean;
    }>
  >("/catalogo/tipos-actividad", { autenticar: false });
}
