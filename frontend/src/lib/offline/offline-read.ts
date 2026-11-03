import type { Actividad, Paso, Tema } from "@/shared/api/api";
import { db, type ActividadLocal, type PasoLocal, type TemaLocal } from "./db";
import { obtenerMedioCacheado, obtenerUrlMediaLocal } from "./media-cache";
import { obtenerIlustracionFallback } from "@/features/media/use-resolved-media-url";

async function buscarTemaLocal(idOrSlug: string): Promise<TemaLocal | undefined> {
  const porServer = await db.temas.where("serverId").equals(idOrSlug).first();
  if (porServer) return porServer;
  const porLocal = await db.temas.get(idOrSlug);
  if (porLocal) return porLocal;
  const porSlug = await db.temas.where("slug").equals(idOrSlug).first();
  return porSlug;
}

export async function obtenerTemaLocalPorServerId(serverId: string): Promise<Tema | null> {
  const local = await buscarTemaLocal(serverId);
  return local ? mapearTemaLocal(local) : null;
}

export async function listarTemasLocalesComoApi(): Promise<Tema[]> {
  const temas = await db.temas.orderBy("downloadedAt").reverse().toArray();
  return temas.map(mapearTemaLocal);
}

export async function obtenerPasosLocalesPorTema(serverId: string, grupoEdadId?: string): Promise<Paso[]> {
  const tema = await buscarTemaLocal(serverId);
  if (!tema) return [];
  const pasos = await db.pasos.where("temaLocalId").equals(tema.localId).sortBy("orden");
  const serverIdFinal = tema.serverId ?? tema.localId;
  return pasos.map((paso) => mapearPasoLocal(paso, serverIdFinal, grupoEdadId));
}

export async function obtenerActividadesLocalesPorTema(serverId: string, grupoEdadId?: string): Promise<Actividad[]> {
  const tema = await buscarTemaLocal(serverId);
  if (!tema) return [];
  const [actividades, pasos] = await Promise.all([
    db.actividades.where("temaLocalId").equals(tema.localId).sortBy("orden"),
    db.pasos.where("temaLocalId").equals(tema.localId).toArray(),
  ]);
  const serverIdFinal = tema.serverId ?? tema.localId;
  const pasoServerPorLocal = new Map(pasos.map((paso) => [paso.localId, paso.serverId ?? paso.localId]));
  const mapeadas = actividades.map((actividad) =>
    mapearActividadLocal(actividad, serverIdFinal, pasoServerPorLocal),
  );
  if (grupoEdadId) {
    const filtradas = mapeadas.filter((a) => !a.grupo_edad_id || a.grupo_edad_id === grupoEdadId);
    if (filtradas.length > 0) return filtradas;
  }
  return mapeadas;
}

export async function obtenerActividadLocalPorServerId(serverId: string): Promise<Actividad | null> {
  const actividad =
    (await db.actividades.where("serverId").equals(serverId).first()) ??
    (await db.actividades.get(serverId));
  if (!actividad) return null;
  const tema = await db.temas.get(actividad.temaLocalId);
  const paso = actividad.pasoLocalId ? await db.pasos.get(actividad.pasoLocalId) : null;
  return mapearActividadLocal(
    actividad,
    tema?.serverId ?? tema?.localId ?? "",
    new Map(
      actividad.pasoLocalId && (paso?.serverId || paso?.localId)
        ? [[actividad.pasoLocalId, paso.serverId ?? paso.localId]]
        : [],
    ),
  );
}

export async function obtenerPortadaLocal(serverId: string): Promise<string | null> {
  const tema = await buscarTemaLocal(serverId);
  if (!tema) return null;
  if (tema.portadaMediaId) {
    try {
      const cached = await obtenerMedioCacheado(tema.portadaMediaId);
      if (cached) {
        const blob = await cached.blob();
        if (blob.size > 0) {
          return URL.createObjectURL(blob);
        }
      }
    } catch {
      // continuar al fallback
    }
  }
  if (tema.portadaUrl && !tema.portadaUrl.startsWith("/__offline_media/") && !tema.portadaUrl.startsWith("/media/") && !tema.portadaUrl.startsWith("privada://")) {
    return tema.portadaUrl;
  }
  return obtenerIlustracionFallback(tema.titulo || tema.sendaNombre);
}

function mapearTemaLocal(local: TemaLocal): Tema {
  const portadaUrl =
    local.portadaUrl && !local.portadaUrl.startsWith("/media/") && !local.portadaUrl.startsWith("privada://")
      ? local.portadaUrl
      : local.portadaMediaId
        ? obtenerUrlMediaLocal(local.portadaMediaId)
        : obtenerIlustracionFallback(local.titulo || local.sendaNombre);

  return {
    id: local.serverId ?? local.localId,
    senda_id: local.sendaId ?? "",
    titulo: local.titulo,
    slug: local.slug,
    objetivo: local.objetivo,
    resumen: local.resumen,
    portada_recurso_id: local.portadaMediaId ?? null,
    estado: local.estado,
    version_biblica_id: null,
    xp_recompensa: local.xpRecompensa,
    minutos_estimados: local.minutosEstimados,
    version_contenido: local.versionContenido,
    publicado_en: local.publicadoEn,
    actualizado_en: local.updatedAt,
    senda: local.sendaId
      ? {
          id: local.sendaId,
          codigo: local.sendaCodigo ?? "",
          nombre: local.sendaNombre ?? "Senda",
          descripcion: null,
          color_hex: local.sendaColorHex ?? "#43a047",
          nombre_icono: null,
          orden: 0,
        }
      : null,
    portada_recurso: {
      id: local.portadaMediaId ?? local.localId,
      url_publica: portadaUrl ?? obtenerIlustracionFallback(local.titulo || local.sendaNombre),
      texto_alternativo: local.titulo,
      titulo: local.titulo,
    },
  };
}

function mapearPasoLocal(local: PasoLocal, temaServerId: string, grupoEdadId?: string): Paso {
  const todosContenidos = local.contenidos.map((contenido) => ({
    id: contenido.id,
    grupo_edad_id: contenido.grupoEdadId,
    titulo: contenido.titulo,
    cuerpo: contenido.cuerpo,
    instruccion_corta: contenido.instruccionCorta,
    recurso_id: contenido.recursoId,
    recurso_audio_id: contenido.recursoAudioId,
    datos_extra: contenido.datosExtra,
  }));

  const contenidosFiltrados =
    grupoEdadId && todosContenidos.some((c) => c.grupo_edad_id === grupoEdadId)
      ? todosContenidos.filter((c) => c.grupo_edad_id === grupoEdadId)
      : todosContenidos;

  const todasPreguntas = local.preguntas.map((pregunta) => ({
    id: pregunta.id,
    grupo_edad_id: pregunta.grupoEdadId,
    pregunta: pregunta.pregunta,
    orden: pregunta.orden,
  }));

  const preguntasFiltradas =
    grupoEdadId && todasPreguntas.some((p) => p.grupo_edad_id === grupoEdadId)
      ? todasPreguntas.filter((p) => p.grupo_edad_id === grupoEdadId)
      : todasPreguntas;

  return {
    id: local.serverId ?? local.localId,
    tema_id: temaServerId,
    orden: local.orden,
    tipo_paso: local.tipoPasoId
      ? {
          id: local.tipoPasoId,
          codigo: local.tipoPasoCodigo ?? "",
          nombre: local.tipoPasoNombre ?? "",
          orden: local.orden,
          color_hex: local.tipoPasoColorHex,
        }
      : null,
    contenidos: contenidosFiltrados,
    preguntas: preguntasFiltradas,
  } as Paso;
}

function mapearActividadLocal(
  local: ActividadLocal,
  temaServerId: string,
  pasoServerPorLocal: Map<string, string | undefined>,
): Actividad {
  return {
    id: local.serverId ?? local.localId,
    tema_id: temaServerId,
    paso_id: local.pasoLocalId ? pasoServerPorLocal.get(local.pasoLocalId) ?? local.pasoLocalId : null,
    grupo_edad_id: local.grupoEdadId,
    tipo_actividad_id: local.tipoActividadId,
    titulo: local.titulo,
    consigna: local.consigna,
    orden: local.orden,
    xp_recompensa: local.xpRecompensa,
    dificultad: local.dificultad,
    limite_tiempo_seg: local.limiteTiempoSeg,
    obligatorio: local.obligatorio,
    retroalimentacion: local.retroalimentacion,
    configuracion: local.configuracion,
    creado_en: local.createdAt,
    actualizado_en: local.updatedAt,
    tipo_actividad: {
      id: local.tipoActividadId,
      codigo: local.tipoActividadCodigo,
      nombre: local.tipoActividadNombre,
      descripcion: local.tipoActividadDescripcion,
      es_juego: local.tipoActividadEsJuego,
      activo: true,
      creado_en: local.createdAt,
    },
    opciones: local.opciones.map((opcion) => ({
      id: opcion.id,
      actividad_id: local.serverId ?? local.localId,
      etiqueta: opcion.etiqueta,
      texto: opcion.texto,
      orden: opcion.orden,
      correcta: opcion.correcta,
      retroalimentacion: opcion.retroalimentacion,
    })),
  } as Actividad;
}
