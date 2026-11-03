import { peticion } from "../../shared/api/api";
import type { Actividad, Paso, Tema } from "../../shared/api/api";
import {
  listarTemasLocalesComoApi,
  obtenerActividadesLocalesPorTema,
  obtenerPasosLocalesPorTema,
  obtenerPortadaLocal,
  obtenerTemaLocalPorServerId,
} from "@/lib/offline/offline-read";
import {
  obtenerIlustracionFallback,
  sendaPadreImg,
  sendaHijoImg,
  sendaEspirituImg,
} from "@/features/media/use-resolved-media-url";

const CACHE_TEMAS_LIST_KEY = "semillas_temas_list_cache_v1";
const CACHE_TEMA_PREFIX = "semillas_tema_cache_v1:";
const CACHE_PASOS_PREFIX = "semillas_pasos_cache_v1:";
const CACHE_ACTIVIDADES_PREFIX = "semillas_actividades_cache_v1:";

const TEMAS_FALLBACK_OFFLINE: Tema[] = [
  {
    id: "47a2e22f-86da-466f-92ff-1847d85de609",
    senda_id: "senda-padre",
    titulo: "El Amor de Dios",
    slug: "el-amor-de-dios",
    objetivo: "Un recorrido tierno y alegre para recordar que el amor de Dios Padre es grande, fiel y eterno.",
    resumen: "Un recorrido tierno y alegre para recordar que el amor de Dios es grande, fiel y para siempre.",
    portada_recurso_id: null,
    estado: "publicado",
    version_biblica_id: null,
    xp_recompensa: 150,
    minutos_estimados: 20,
    version_contenido: 1,
    publicado_en: "2026-07-05T00:00:00.000Z",
    actualizado_en: "2026-07-05T00:00:00.000Z",
    senda: {
      id: "senda-padre",
      codigo: "padre",
      nombre: "Senda del Padre",
      descripcion: "Dios es nuestro Padre amoroso.",
      color_hex: "#3D8BD4",
      nombre_icono: "crown",
      orden: 1,
    },
    portada_recurso: {
      id: "portada-padre",
      url_publica: sendaPadreImg,
      texto_alternativo: "El Amor de Dios",
      titulo: "El Amor de Dios",
    },
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    senda_id: "senda-hijo",
    titulo: "Jesús enseña con parábolas",
    slug: "jesus-ensena-con-parabolas",
    objetivo: "Jesús usa parábolas para enseñar verdades profundas de una forma clara, bonita y fácil de aplicar.",
    resumen: "Jesús usa parábolas para enseñar verdades profundas de una forma clara, bonita y fácil.",
    portada_recurso_id: null,
    estado: "publicado",
    version_biblica_id: null,
    xp_recompensa: 150,
    minutos_estimados: 20,
    version_contenido: 1,
    publicado_en: "2026-07-05T00:00:00.000Z",
    actualizado_en: "2026-07-05T00:00:00.000Z",
    senda: {
      id: "senda-hijo",
      codigo: "hijo",
      nombre: "Senda del Hijo",
      descripcion: "Jesús es nuestro Salvador y amigo.",
      color_hex: "#E9A23B",
      nombre_icono: "heart",
      orden: 2,
    },
    portada_recurso: {
      id: "portada-hijo",
      url_publica: sendaHijoImg,
      texto_alternativo: "Jesús enseña con parábolas",
      titulo: "Jesús enseña con parábolas",
    },
  },
  {
    id: "20000000-0000-0000-0000-000000000003",
    senda_id: "senda-espiritu",
    titulo: "Los frutos del Espíritu",
    slug: "los-frutos-del-espiritu",
    objetivo: "Una aventura alegre para conocer el amor, gozo, paz, paciencia y otros frutos que el Espíritu Santo produce.",
    resumen: "Una aventura alegre para conocer el amor, gozo, paz, paciencia y otros frutos que produce el Espíritu.",
    portada_recurso_id: null,
    estado: "publicado",
    version_biblica_id: null,
    xp_recompensa: 150,
    minutos_estimados: 20,
    version_contenido: 1,
    publicado_en: "2026-07-05T00:00:00.000Z",
    actualizado_en: "2026-07-05T00:00:00.000Z",
    senda: {
      id: "senda-espiritu",
      codigo: "espiritu",
      nombre: "Senda del Espíritu Santo",
      descripcion: "El Espíritu Santo nos guía y fortalece.",
      color_hex: "#17A398",
      nombre_icono: "flame",
      orden: 3,
    },
    portada_recurso: {
      id: "portada-espiritu",
      url_publica: sendaEspirituImg,
      texto_alternativo: "Los frutos del Espíritu",
      titulo: "Los frutos del Espíritu",
    },
  },
];

function guardarJsonLocal(clave: string, valor: unknown) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(clave, JSON.stringify(valor));
    }
  } catch {
    // ignorar si localStorage está lleno
  }
}

function leerJsonLocal<T>(clave: string): T | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(clave);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function obtenerTemasFallbackOffline(sendaId?: string): Promise<Tema[]> {
  const locales = await listarTemasLocalesComoApi();
  const cacheados = leerJsonLocal<Tema[]>(CACHE_TEMAS_LIST_KEY) ?? [];

  const mapa = new Map<string, Tema>();
  for (const t of locales) mapa.set(t.id, t);
  for (const t of cacheados) {
    if (!mapa.has(t.id)) mapa.set(t.id, t);
  }

  const combinados = mapa.size > 0 ? Array.from(mapa.values()) : TEMAS_FALLBACK_OFFLINE;
  return sendaId ? combinados.filter((tema) => tema.senda_id === sendaId) : combinados;
}

export async function obtenerTemas(params?: { senda_id?: string; grupo_edad_id?: string }) {
  const busqueda = new URLSearchParams();
  if (params?.senda_id) busqueda.set("senda_id", params.senda_id);
  if (params?.grupo_edad_id) busqueda.set("grupo_edad_id", params.grupo_edad_id);
  const query = busqueda.toString();

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return obtenerTemasFallbackOffline(params?.senda_id);
  }

  try {
    const remotos = await peticion<Tema[]>(`/temas${query ? `?${query}` : ""}`, {
      autenticar: false,
    });
    if (remotos.length > 0) {
      guardarJsonLocal(CACHE_TEMAS_LIST_KEY, remotos);
      for (const t of remotos) {
        guardarJsonLocal(`${CACHE_TEMA_PREFIX}${t.id}`, t);
        if (t.slug) guardarJsonLocal(`${CACHE_TEMA_PREFIX}${t.slug}`, t);
      }
    }
    return remotos;
  } catch {
    return obtenerTemasFallbackOffline(params?.senda_id);
  }
}

async function resolverTemaFallback(idTema: string): Promise<Tema> {
  const local = await obtenerTemaLocalPorServerId(idTema);
  if (local) return local;

  const cacheado = leerJsonLocal<Tema>(`${CACHE_TEMA_PREFIX}${idTema}`);
  if (cacheado) return cacheado;

  const listaCacheada = leerJsonLocal<Tema[]>(CACHE_TEMAS_LIST_KEY) ?? [];
  const deLista = listaCacheada.find((t) => t.id === idTema || t.slug === idTema);
  if (deLista) return deLista;

  const locales = await listarTemasLocalesComoApi();
  const deLocales = locales.find((t) => t.id === idTema || t.slug === idTema);
  if (deLocales) return deLocales;

  const deFallback =
    TEMAS_FALLBACK_OFFLINE.find((t) => t.id === idTema || t.slug === idTema) ??
    TEMAS_FALLBACK_OFFLINE[0]!;

  return {
    ...deFallback,
    id: idTema,
  };
}

export async function obtenerTema(idTema: string): Promise<Tema> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return resolverTemaFallback(idTema);
  }

  try {
    const remoto = await peticion<Tema>(`/temas/${idTema}`, { autenticar: false });
    guardarJsonLocal(`${CACHE_TEMA_PREFIX}${idTema}`, remoto);
    if (remoto.id) guardarJsonLocal(`${CACHE_TEMA_PREFIX}${remoto.id}`, remoto);
    if (remoto.slug) guardarJsonLocal(`${CACHE_TEMA_PREFIX}${remoto.slug}`, remoto);
    return remoto;
  } catch {
    return resolverTemaFallback(idTema);
  }
}

export async function obtenerUrlPortadaTema(idTema: string) {
  const local = await obtenerPortadaLocal(idTema);
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return {
      url: local ?? obtenerIlustracionFallback(idTema),
      expira_en_segundos: 0,
    };
  }

  try {
    return await peticion<{ url: string; expira_en_segundos: number }>(
      `/temas/${idTema}/portada`,
      { autenticar: false },
    );
  } catch {
    return {
      url: local ?? obtenerIlustracionFallback(idTema),
      expira_en_segundos: 0,
    };
  }
}

export async function obtenerPasos(idTema: string, idGrupoEdad?: string): Promise<Paso[]> {
  const busqueda = new URLSearchParams();
  if (idGrupoEdad) busqueda.set("grupo_edad_id", idGrupoEdad);
  const query = busqueda.toString();

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const locales = await obtenerPasosLocalesPorTema(idTema, idGrupoEdad);
    if (locales.length > 0) return locales;
    const cacheados =
      leerJsonLocal<Paso[]>(`${CACHE_PASOS_PREFIX}${idTema}:${idGrupoEdad ?? "all"}`) ??
      leerJsonLocal<Paso[]>(`${CACHE_PASOS_PREFIX}${idTema}:all`);
    return cacheados ?? [];
  }

  try {
    const remotos = await peticion<Paso[]>(`/temas/${idTema}/pasos${query ? `?${query}` : ""}`, {
      autenticar: false,
    });
    if (remotos.length > 0 && remotos.some((p) => (p.contenidos?.length ?? 0) > 0)) {
      guardarJsonLocal(`${CACHE_PASOS_PREFIX}${idTema}:${idGrupoEdad ?? "all"}`, remotos);
      guardarJsonLocal(`${CACHE_PASOS_PREFIX}${idTema}:all`, remotos);
      return remotos;
    }
    if (idGrupoEdad) {
      const todos = await peticion<Paso[]>(`/temas/${idTema}/pasos`, { autenticar: false });
      if (todos.length > 0) {
        guardarJsonLocal(`${CACHE_PASOS_PREFIX}${idTema}:all`, todos);
        return todos;
      }
    }
    return remotos;
  } catch {
    const locales = await obtenerPasosLocalesPorTema(idTema, idGrupoEdad);
    if (locales.length > 0) return locales;
    const cacheados =
      leerJsonLocal<Paso[]>(`${CACHE_PASOS_PREFIX}${idTema}:${idGrupoEdad ?? "all"}`) ??
      leerJsonLocal<Paso[]>(`${CACHE_PASOS_PREFIX}${idTema}:all`);
    return cacheados ?? [];
  }
}

export async function obtenerActividades(idTema: string, idGrupoEdad?: string): Promise<Actividad[]> {
  const busqueda = new URLSearchParams();
  if (idGrupoEdad) busqueda.set("grupo_edad_id", idGrupoEdad);
  const query = busqueda.toString();

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const locales = await obtenerActividadesLocalesPorTema(idTema, idGrupoEdad);
    if (locales.length > 0) return locales;
    const cacheadas =
      leerJsonLocal<Actividad[]>(`${CACHE_ACTIVIDADES_PREFIX}${idTema}:${idGrupoEdad ?? "all"}`) ??
      leerJsonLocal<Actividad[]>(`${CACHE_ACTIVIDADES_PREFIX}${idTema}:all`);
    return cacheadas ?? [];
  }

  try {
    const actividadesFiltradas = await peticion<Actividad[]>(
      `/temas/${idTema}/actividades${query ? `?${query}` : ""}`,
      { autenticar: false },
    );
    if (actividadesFiltradas.length > 0) {
      guardarJsonLocal(`${CACHE_ACTIVIDADES_PREFIX}${idTema}:${idGrupoEdad ?? "all"}`, actividadesFiltradas);
      guardarJsonLocal(`${CACHE_ACTIVIDADES_PREFIX}${idTema}:all`, actividadesFiltradas);
      return actividadesFiltradas;
    }
    if (idGrupoEdad) {
      const todas = await peticion<Actividad[]>(`/temas/${idTema}/actividades`, {
        autenticar: false,
      });
      if (todas.length > 0) {
        guardarJsonLocal(`${CACHE_ACTIVIDADES_PREFIX}${idTema}:all`, todas);
        return todas;
      }
    }
    return actividadesFiltradas;
  } catch {
    const locales = await obtenerActividadesLocalesPorTema(idTema, idGrupoEdad);
    if (locales.length > 0) return locales;
    const cacheadas =
      leerJsonLocal<Actividad[]>(`${CACHE_ACTIVIDADES_PREFIX}${idTema}:${idGrupoEdad ?? "all"}`) ??
      leerJsonLocal<Actividad[]>(`${CACHE_ACTIVIDADES_PREFIX}${idTema}:all`);
    return cacheadas ?? [];
  }
}
