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

export const TEMAS_POR_GRUPO_EDAD: Record<"semillas" | "exploradores" | "embajadores", Tema[]> = {
  semillas: [
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
      minutos_estimados: 15,
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
      minutos_estimados: 15,
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
      minutos_estimados: 15,
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
  ],
  exploradores: [
    {
      id: "30000000-0000-0000-0000-000000000001",
      senda_id: "senda-padre",
      titulo: "La Fidelidad y el Pacto de Dios",
      slug: "la-fidelidad-y-el-pacto-de-dios",
      objetivo: "Explorar las promesas y pactos que Dios hizo con Abraham, Moisés y David, descubriendo su fidelidad inquebrantable.",
      resumen: "Descubre cómo Dios cumple cada una de sus promesas a través de grandes historias y desafíos de fe.",
      portada_recurso_id: null,
      estado: "publicado",
      version_biblica_id: null,
      xp_recompensa: 200,
      minutos_estimados: 20,
      version_contenido: 1,
      publicado_en: "2026-07-05T00:00:00.000Z",
      actualizado_en: "2026-07-05T00:00:00.000Z",
      senda: {
        id: "senda-padre",
        codigo: "padre",
        nombre: "Senda del Padre",
        descripcion: "Dios es fiel y guarda sus pactos para siempre.",
        color_hex: "#3D8BD4",
        nombre_icono: "crown",
        orden: 1,
      },
      portada_recurso: {
        id: "portada-padre-exp",
        url_publica: sendaPadreImg,
        texto_alternativo: "La Fidelidad y el Pacto de Dios",
        titulo: "La Fidelidad y el Pacto de Dios",
      },
    },
    {
      id: "30000000-0000-0000-0000-000000000002",
      senda_id: "senda-hijo",
      titulo: "Milagros y Misión de Jesús",
      slug: "milagros-y-mision-de-jesus",
      objetivo: "Investigar los milagros de Jesús y entender su poder sobre la naturaleza, la enfermedad y la vida.",
      resumen: "Explora el ministerio transformador de Cristo y cómo su compasión cambió la historia para siempre.",
      portada_recurso_id: null,
      estado: "publicado",
      version_biblica_id: null,
      xp_recompensa: 200,
      minutos_estimados: 20,
      version_contenido: 1,
      publicado_en: "2026-07-05T00:00:00.000Z",
      actualizado_en: "2026-07-05T00:00:00.000Z",
      senda: {
        id: "senda-hijo",
        codigo: "hijo",
        nombre: "Senda del Hijo",
        descripcion: "Jesús nuestro Salvador, Maestro y Señor poderoso.",
        color_hex: "#E9A23B",
        nombre_icono: "heart",
        orden: 2,
      },
      portada_recurso: {
        id: "portada-hijo-exp",
        url_publica: sendaHijoImg,
        texto_alternativo: "Milagros y Misión de Jesús",
        titulo: "Milagros y Misión de Jesús",
      },
    },
    {
      id: "30000000-0000-0000-0000-000000000003",
      senda_id: "senda-espiritu",
      titulo: "Fuerza y Dirección del Espíritu",
      slug: "fuerza-y-direccion-del-espiritu",
      objetivo: "Conocer el poder del Espíritu Santo en el libro de Hechos y cómo capacita a los creyentes con valentía.",
      resumen: "Acompaña a la iglesia primitiva en una emocionante travesía guiada por el fuego del Espíritu Santo.",
      portada_recurso_id: null,
      estado: "publicado",
      version_biblica_id: null,
      xp_recompensa: 200,
      minutos_estimados: 20,
      version_contenido: 1,
      publicado_en: "2026-07-05T00:00:00.000Z",
      actualizado_en: "2026-07-05T00:00:00.000Z",
      senda: {
        id: "senda-espiritu",
        codigo: "espiritu",
        nombre: "Senda del Espíritu Santo",
        descripcion: "El Espíritu nos llena de valor, poder y sabiduría.",
        color_hex: "#17A398",
        nombre_icono: "flame",
        orden: 3,
      },
      portada_recurso: {
        id: "portada-espiritu-exp",
        url_publica: sendaEspirituImg,
        texto_alternativo: "Fuerza y Dirección del Espíritu",
        titulo: "Fuerza y Dirección del Espíritu",
      },
    },
  ],
  embajadores: [
    {
      id: "40000000-0000-0000-0000-000000000001",
      senda_id: "senda-padre",
      titulo: "Fundamentos de la Fe y Propósito Eterno",
      slug: "fundamentos-de-la-fe-y-proposito-eterno",
      objetivo: "Profundizar en la soberanía divina, la cosmovisión bíblica y el propósito eterno que Dios diseñó para tu vida.",
      resumen: "Reflexión sólida y profunda para arraigar tus convicciones en la verdad inmutable del Padre celestial.",
      portada_recurso_id: null,
      estado: "publicado",
      version_biblica_id: null,
      xp_recompensa: 250,
      minutos_estimados: 25,
      version_contenido: 1,
      publicado_en: "2026-07-05T00:00:00.000Z",
      actualizado_en: "2026-07-05T00:00:00.000Z",
      senda: {
        id: "senda-padre",
        codigo: "padre",
        nombre: "Senda del Padre",
        descripcion: "El Creador soberano que nos llama a su propósito eterno.",
        color_hex: "#3D8BD4",
        nombre_icono: "crown",
        orden: 1,
      },
      portada_recurso: {
        id: "portada-padre-emb",
        url_publica: sendaPadreImg,
        texto_alternativo: "Fundamentos de la Fe y Propósito Eterno",
        titulo: "Fundamentos de la Fe y Propósito Eterno",
      },
    },
    {
      id: "40000000-0000-0000-0000-000000000002",
      senda_id: "senda-hijo",
      titulo: "El Camino del Discipulado Radical",
      slug: "el-camino-del-discipulado-radical",
      objetivo: "Analizar el llamado de Cristo a negarse a uno mismo, tomar la cruz y vivir el evangelio en un mundo desafiante.",
      resumen: "Desafíos prácticos para jóvenes que deciden seguir a Jesús con valentía, integridad y liderazgo.",
      portada_recurso_id: null,
      estado: "publicado",
      version_biblica_id: null,
      xp_recompensa: 250,
      minutos_estimados: 25,
      version_contenido: 1,
      publicado_en: "2026-07-05T00:00:00.000Z",
      actualizado_en: "2026-07-05T00:00:00.000Z",
      senda: {
        id: "senda-hijo",
        codigo: "hijo",
        nombre: "Senda del Hijo",
        descripcion: "Cristo el Rey de Reyes que nos llama al discipulado total.",
        color_hex: "#E9A23B",
        nombre_icono: "heart",
        orden: 2,
      },
      portada_recurso: {
        id: "portada-hijo-emb",
        url_publica: sendaHijoImg,
        texto_alternativo: "El Camino del Discipulado Radical",
        titulo: "El Camino del Discipulado Radical",
      },
    },
    {
      id: "40000000-0000-0000-0000-000000000003",
      senda_id: "senda-espiritu",
      titulo: "Dones Espirituales y Transformación",
      slug: "dones-espirituales-y-transformacion",
      objetivo: "Identificar los dones del Espíritu Santo, cultivar discernimiento moral y ser agentes de reconciliación en la sociedad.",
      resumen: "Aprende a caminar bajo la unción del Espíritu Santo para transformar tu entorno y servir al prójimo.",
      portada_recurso_id: null,
      estado: "publicado",
      version_biblica_id: null,
      xp_recompensa: 250,
      minutos_estimados: 25,
      version_contenido: 1,
      publicado_en: "2026-07-05T00:00:00.000Z",
      actualizado_en: "2026-07-05T00:00:00.000Z",
      senda: {
        id: "senda-espiritu",
        codigo: "espiritu",
        nombre: "Senda del Espíritu Santo",
        descripcion: "El Espíritu Santo que nos transforma y envía con poder.",
        color_hex: "#17A398",
        nombre_icono: "flame",
        orden: 3,
      },
      portada_recurso: {
        id: "portada-espiritu-emb",
        url_publica: sendaEspirituImg,
        texto_alternativo: "Dones Espirituales y Transformación",
        titulo: "Dones Espirituales y Transformación",
      },
    },
  ],
};

const TEMAS_FALLBACK_OFFLINE: Tema[] = TEMAS_POR_GRUPO_EDAD.semillas;

export function resolverGrupoCodigo(grupoId?: string): "semillas" | "exploradores" | "embajadores" {
  if (!grupoId) return "semillas";
  const g = grupoId.toLowerCase();
  if (
    g.includes("explorador") ||
    g === "4afa01e2-96c1-4055-b88a-adc4f0303165" ||
    g === "e1000000-0000-0000-0000-000000000002" ||
    g === "10000000-0000-0000-0000-000000000002"
  ) {
    return "exploradores";
  }
  if (
    g.includes("embajador") ||
    g === "4a69e67c-4fd3-4263-8f30-58416f323870" ||
    g === "e1000000-0000-0000-0000-000000000003" ||
    g === "10000000-0000-0000-0000-000000000003"
  ) {
    return "embajadores";
  }
  return "semillas";
}

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

async function obtenerTemasFallbackOffline(sendaId?: string, grupoEdadId?: string): Promise<Tema[]> {
  const codigoGrupo = resolverGrupoCodigo(grupoEdadId);
  const basePorEdad = TEMAS_POR_GRUPO_EDAD[codigoGrupo] ?? TEMAS_FALLBACK_OFFLINE;
  const locales = await listarTemasLocalesComoApi();
  const cacheKey = `${CACHE_TEMAS_LIST_KEY}:${codigoGrupo}`;
  const cacheados = leerJsonLocal<Tema[]>(cacheKey) ?? leerJsonLocal<Tema[]>(CACHE_TEMAS_LIST_KEY) ?? [];

  const mapa = new Map<string, Tema>();
  for (const t of basePorEdad) mapa.set(t.id, t);
  for (const t of cacheados) {
    if (!mapa.has(t.id)) mapa.set(t.id, t);
  }
  for (const t of locales) mapa.set(t.id, t);

  const combinados = Array.from(mapa.values());
  return sendaId ? combinados.filter((tema) => tema.senda_id === sendaId || tema.senda?.codigo === sendaId) : combinados;
}

export async function obtenerTemas(params?: { senda_id?: string; grupo_edad_id?: string }) {
  const codigoGrupo = resolverGrupoCodigo(params?.grupo_edad_id);
  const busqueda = new URLSearchParams();
  if (params?.senda_id) busqueda.set("senda_id", params.senda_id);
  if (params?.grupo_edad_id) busqueda.set("grupo_edad_id", params.grupo_edad_id);
  const query = busqueda.toString();

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return obtenerTemasFallbackOffline(params?.senda_id, params?.grupo_edad_id);
  }

  try {
    const remotos = await peticion<Tema[]>(`/temas${query ? `?${query}` : ""}`, {
      autenticar: false,
    });

    let temasFinales = remotos;
    // Si el backend retornó temas y el usuario es de exploradores o embajadores,
    // verificar si los temas remotos son exclusivamente el set estándar de semillas
    if (codigoGrupo !== "semillas" && remotos.length > 0) {
      const todosSonSemillas = remotos.every(
        (t) =>
          t.slug === "el-amor-de-dios" ||
          t.slug === "jesus-ensena-con-parabolas" ||
          t.slug === "los-frutos-del-espiritu",
      );
      if (todosSonSemillas) {
        temasFinales = TEMAS_POR_GRUPO_EDAD[codigoGrupo];
      }
    } else if (remotos.length === 0) {
      temasFinales = TEMAS_POR_GRUPO_EDAD[codigoGrupo];
    }

    const cacheKey = `${CACHE_TEMAS_LIST_KEY}:${codigoGrupo}`;
    guardarJsonLocal(cacheKey, temasFinales);
    guardarJsonLocal(CACHE_TEMAS_LIST_KEY, temasFinales);
    for (const t of temasFinales) {
      guardarJsonLocal(`${CACHE_TEMA_PREFIX}${t.id}`, t);
      if (t.slug) guardarJsonLocal(`${CACHE_TEMA_PREFIX}${t.slug}`, t);
    }
    return params?.senda_id
      ? temasFinales.filter((t) => t.senda_id === params.senda_id || t.senda?.codigo === params.senda_id)
      : temasFinales;
  } catch {
    return obtenerTemasFallbackOffline(params?.senda_id, params?.grupo_edad_id);
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

  const todosFallbacks = [
    ...TEMAS_POR_GRUPO_EDAD.semillas,
    ...TEMAS_POR_GRUPO_EDAD.exploradores,
    ...TEMAS_POR_GRUPO_EDAD.embajadores,
  ];

  const deFallback =
    todosFallbacks.find((t) => t.id === idTema || t.slug === idTema) ??
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
