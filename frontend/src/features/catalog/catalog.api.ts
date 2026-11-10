import { peticion } from "../../shared/api/api";
import type { GrupoEdad } from "../../shared/api/api";

const CACHE_GRUPOS_EDAD_KEY = "semillas_grupos_edad_cache_v1";

export type LibroBiblicoCatalogo = {
  id: number;
  nombre: string;
  abreviatura: string;
  testamento: "AT" | "NT";
  orden: number;
};

export const LIBROS_BIBLICOS_CATALOGO: LibroBiblicoCatalogo[] = [
  { id: 1, nombre: "Génesis", abreviatura: "Gn", testamento: "AT", orden: 1 },
  { id: 2, nombre: "Éxodo", abreviatura: "Éx", testamento: "AT", orden: 2 },
  { id: 3, nombre: "Levítico", abreviatura: "Lv", testamento: "AT", orden: 3 },
  { id: 4, nombre: "Números", abreviatura: "Nm", testamento: "AT", orden: 4 },
  { id: 5, nombre: "Deuteronomio", abreviatura: "Dt", testamento: "AT", orden: 5 },
  { id: 6, nombre: "Josué", abreviatura: "Jos", testamento: "AT", orden: 6 },
  { id: 7, nombre: "Jueces", abreviatura: "Jue", testamento: "AT", orden: 7 },
  { id: 8, nombre: "Rut", abreviatura: "Rt", testamento: "AT", orden: 8 },
  { id: 9, nombre: "1 Samuel", abreviatura: "1 S", testamento: "AT", orden: 9 },
  { id: 10, nombre: "2 Samuel", abreviatura: "2 S", testamento: "AT", orden: 10 },
  { id: 11, nombre: "1 Reyes", abreviatura: "1 R", testamento: "AT", orden: 11 },
  { id: 12, nombre: "2 Reyes", abreviatura: "2 R", testamento: "AT", orden: 12 },
  { id: 13, nombre: "1 Crónicas", abreviatura: "1 Cr", testamento: "AT", orden: 13 },
  { id: 14, nombre: "2 Crónicas", abreviatura: "2 Cr", testamento: "AT", orden: 14 },
  { id: 15, nombre: "Esdras", abreviatura: "Esd", testamento: "AT", orden: 15 },
  { id: 16, nombre: "Nehemías", abreviatura: "Neh", testamento: "AT", orden: 16 },
  { id: 17, nombre: "Ester", abreviatura: "Est", testamento: "AT", orden: 17 },
  { id: 18, nombre: "Job", abreviatura: "Job", testamento: "AT", orden: 18 },
  { id: 19, nombre: "Salmos", abreviatura: "Sal", testamento: "AT", orden: 19 },
  { id: 20, nombre: "Proverbios", abreviatura: "Pr", testamento: "AT", orden: 20 },
  { id: 21, nombre: "Eclesiastés", abreviatura: "Ec", testamento: "AT", orden: 21 },
  { id: 22, nombre: "Cantares", abreviatura: "Cnt", testamento: "AT", orden: 22 },
  { id: 23, nombre: "Isaías", abreviatura: "Is", testamento: "AT", orden: 23 },
  { id: 24, nombre: "Jeremías", abreviatura: "Jer", testamento: "AT", orden: 24 },
  { id: 25, nombre: "Lamentaciones", abreviatura: "Lm", testamento: "AT", orden: 25 },
  { id: 26, nombre: "Ezequiel", abreviatura: "Ez", testamento: "AT", orden: 26 },
  { id: 27, nombre: "Daniel", abreviatura: "Dn", testamento: "AT", orden: 27 },
  { id: 28, nombre: "Oseas", abreviatura: "Os", testamento: "AT", orden: 28 },
  { id: 29, nombre: "Joel", abreviatura: "Jl", testamento: "AT", orden: 29 },
  { id: 30, nombre: "Amós", abreviatura: "Am", testamento: "AT", orden: 30 },
  { id: 31, nombre: "Abdías", abreviatura: "Abd", testamento: "AT", orden: 31 },
  { id: 32, nombre: "Jonás", abreviatura: "Jon", testamento: "AT", orden: 32 },
  { id: 33, nombre: "Miqueas", abreviatura: "Mi", testamento: "AT", orden: 33 },
  { id: 34, nombre: "Nahúm", abreviatura: "Nah", testamento: "AT", orden: 34 },
  { id: 35, nombre: "Habacuc", abreviatura: "Hab", testamento: "AT", orden: 35 },
  { id: 36, nombre: "Sofonías", abreviatura: "Sof", testamento: "AT", orden: 36 },
  { id: 37, nombre: "Hageo", abreviatura: "Hag", testamento: "AT", orden: 37 },
  { id: 38, nombre: "Zacarías", abreviatura: "Zac", testamento: "AT", orden: 38 },
  { id: 39, nombre: "Malaquías", abreviatura: "Mal", testamento: "AT", orden: 39 },
  { id: 40, nombre: "Mateo", abreviatura: "Mt", testamento: "NT", orden: 40 },
  { id: 41, nombre: "Marcos", abreviatura: "Mr", testamento: "NT", orden: 41 },
  { id: 42, nombre: "Lucas", abreviatura: "Lc", testamento: "NT", orden: 42 },
  { id: 43, nombre: "Juan", abreviatura: "Jn", testamento: "NT", orden: 43 },
  { id: 44, nombre: "Hechos", abreviatura: "Hch", testamento: "NT", orden: 44 },
  { id: 45, nombre: "Romanos", abreviatura: "Ro", testamento: "NT", orden: 45 },
  { id: 46, nombre: "1 Corintios", abreviatura: "1 Co", testamento: "NT", orden: 46 },
  { id: 47, nombre: "2 Corintios", abreviatura: "2 Co", testamento: "NT", orden: 47 },
  { id: 48, nombre: "Gálatas", abreviatura: "Gá", testamento: "NT", orden: 48 },
  { id: 49, nombre: "Efesios", abreviatura: "Ef", testamento: "NT", orden: 49 },
  { id: 50, nombre: "Filipenses", abreviatura: "Fil", testamento: "NT", orden: 50 },
  { id: 51, nombre: "Colosenses", abreviatura: "Col", testamento: "NT", orden: 51 },
  { id: 52, nombre: "1 Tesalonicenses", abreviatura: "1 Ts", testamento: "NT", orden: 52 },
  { id: 53, nombre: "2 Tesalonicenses", abreviatura: "2 Ts", testamento: "NT", orden: 53 },
  { id: 54, nombre: "1 Timoteo", abreviatura: "1 Ti", testamento: "NT", orden: 54 },
  { id: 55, nombre: "2 Timoteo", abreviatura: "2 Ti", testamento: "NT", orden: 55 },
  { id: 56, nombre: "Tito", abreviatura: "Tit", testamento: "NT", orden: 56 },
  { id: 57, nombre: "Filemón", abreviatura: "Flm", testamento: "NT", orden: 57 },
  { id: 58, nombre: "Hebreos", abreviatura: "He", testamento: "NT", orden: 58 },
  { id: 59, nombre: "Santiago", abreviatura: "Stg", testamento: "NT", orden: 59 },
  { id: 60, nombre: "1 Pedro", abreviatura: "1 P", testamento: "NT", orden: 60 },
  { id: 61, nombre: "2 Pedro", abreviatura: "2 P", testamento: "NT", orden: 61 },
  { id: 62, nombre: "1 Juan", abreviatura: "1 Jn", testamento: "NT", orden: 62 },
  { id: 63, nombre: "2 Juan", abreviatura: "2 Jn", testamento: "NT", orden: 63 },
  { id: 64, nombre: "3 Juan", abreviatura: "3 Jn", testamento: "NT", orden: 64 },
  { id: 65, nombre: "Judas", abreviatura: "Jud", testamento: "NT", orden: 65 },
  { id: 66, nombre: "Apocalipsis", abreviatura: "Ap", testamento: "NT", orden: 66 },
];

export function obtenerNombreLibroBiblico(libroId?: number | null): string {
  if (!libroId) return "Biblia";
  return LIBROS_BIBLICOS_CATALOGO.find((libro) => libro.id === Number(libroId))?.nombre ?? `Libro ${libroId}`;
}

export async function obtenerLibrosBiblicos(): Promise<LibroBiblicoCatalogo[]> {
  return LIBROS_BIBLICOS_CATALOGO;
}

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
