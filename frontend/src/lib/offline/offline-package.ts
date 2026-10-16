import type { ActividadLocal, PasoLocal, TemaLocal } from "./db";
import { crearMapaIdsLocales, obtenerIdLocal } from "./local-id-map";

export type PaqueteOfflineRespuesta = {
  paquete_id: string | null;
  tamano_bytes: number;
  schema_version: number;
  generado_en: string;
  grupo_edad_id: string;
  tema: {
    id: string;
    senda_id: string;
    titulo: string;
    slug: string;
    objetivo: string;
    resumen: string | null;
    portada_recurso_id: string | null;
    estado: string;
    version_biblica_id: string | null;
    xp_recompensa: number;
    minutos_estimados: number;
    version_contenido: number;
    publicado_en: string | null;
    creado_en: string | null;
    actualizado_en: string | null;
    senda?: {
      id: string;
      codigo: string;
      nombre: string;
      descripcion: string | null;
      color_hex: string;
      nombre_icono: string | null;
      orden: number;
    } | null;
    portada_recurso?: {
      id: string;
      tipo?: string | null;
      url_publica: string;
      texto_alternativo: string | null;
      titulo: string | null;
      tipo_mime?: string | null;
      tamano_bytes?: number | null;
      duracion_seg?: number | null;
      ancho_px?: number | null;
      alto_px?: number | null;
    } | null;
  };
  pasos: Array<{
    id: string;
    tema_id: string;
    orden: number;
    obligatorio: boolean;
    tipo_paso: {
      id: string;
      codigo: string;
      nombre: string;
      descripcion: string | null;
      orden: number;
      color_hex: string | null;
    } | null;
    contenidos: Array<{
      id: string;
      paso_id: string;
      grupo_edad_id: string;
      titulo: string;
      cuerpo: string;
      instruccion_corta: string | null;
      recurso_id?: string | null;
      recurso_audio_id?: string | null;
      datos_extra?: Record<string, unknown> | null;
    }>;
    preguntas: Array<{
      id: string;
      paso_id: string;
      grupo_edad_id: string;
      pregunta: string;
      orden: number;
    }>;
  }>;
  actividades: Array<{
    id: string;
    tema_id: string;
    paso_id: string | null;
    grupo_edad_id: string;
    tipo_actividad_id: string;
    titulo: string;
    consigna: string;
    orden: number;
    xp_recompensa: number;
    dificultad: string;
    limite_tiempo_seg: number | null;
    obligatorio: boolean;
    retroalimentacion: string | null;
    configuracion: Record<string, unknown>;
    creado_en: string;
    actualizado_en: string;
    tipo_actividad: {
      id: string;
      codigo: string;
      nombre: string;
      descripcion: string | null;
      es_juego: boolean;
      activo: boolean;
      creado_en: string;
    } | null;
    opciones: Array<{
      id: string;
      actividad_id: string;
      etiqueta: string | null;
      texto: string;
      orden: number;
      correcta?: boolean;
      retroalimentacion?: string | null;
    }>;
  }>;
  medios: Array<{
    id: string;
    tipo: "imagen" | "audio" | "video" | "archivo";
    titulo: string | null;
    url_descarga: string;
    texto_alternativo: string | null;
    tipo_mime: string | null;
    tamano_bytes: number | null;
    duracion_seg: number | null;
    ancho_px: number | null;
    alto_px: number | null;
  }>;
};

export type RegistrosOfflinePaquete = {
  tema: TemaLocal;
  pasos: PasoLocal[];
  actividades: ActividadLocal[];
  medios: Array<{
    serverId: string;
    tipo: "imagen" | "audio" | "video" | "archivo";
    urlOriginal: string;
    urlLocal: string;
    textoAlternativo: string | null;
    tamanoBytes: number | null;
    duracionSeg: number | null;
    anchoPx: number | null;
    altoPx: number | null;
  }>;
  tamanoMB: number;
};

export function construirRutaMediaOffline(recursoId: string): string {
  return `/__offline_media/${recursoId}`;
}

export function mapearPaqueteOfflineARegistros(
  paquete: PaqueteOfflineRespuesta,
  mapaExistente: ReadonlyMap<string, string> = new Map(),
): RegistrosOfflinePaquete {
  const idsServidor = [
    paquete.tema.id,
    ...paquete.pasos.map((paso) => paso.id),
    ...paquete.actividades.map((actividad) => actividad.id),
  ];
  const idsLocales = crearMapaIdsLocales(idsServidor, mapaExistente);
  const idTemaLocal = obtenerIdLocal(idsLocales, paquete.tema.id);
  const tema: TemaLocal = {
    localId: idTemaLocal,
    serverId: paquete.tema.id,
    paqueteId: paquete.paquete_id,
    paqueteVersionContenido: paquete.tema.version_contenido,
    titulo: paquete.tema.titulo,
    slug: paquete.tema.slug,
    objetivo: paquete.tema.objetivo,
    resumen: paquete.tema.resumen,
    portadaUrl: paquete.tema.portada_recurso?.url_publica ?? null,
    portadaMediaId: paquete.tema.portada_recurso_id,
    sendaId: paquete.tema.senda?.id ?? paquete.tema.senda_id,
    sendaCodigo: paquete.tema.senda?.codigo ?? null,
    sendaNombre: paquete.tema.senda?.nombre ?? null,
    sendaColorHex: paquete.tema.senda?.color_hex ?? null,
    estado: paquete.tema.estado,
    xpRecompensa: paquete.tema.xp_recompensa,
    minutosEstimados: paquete.tema.minutos_estimados,
    versionContenido: paquete.tema.version_contenido,
    publicadoEn: paquete.tema.publicado_en,
    grupoEdadId: paquete.grupo_edad_id,
    paqueteTamanoBytes: paquete.tamano_bytes,
    packageId: paquete.paquete_id,
    packageSizeBytes: paquete.tamano_bytes,
    mediaServerIds: paquete.medios.map((medio) => medio.id),
    downloadedAt: paquete.generado_en,
    lastOpenedAt: null,
    descargaEstado: "descargando",
    descargaProgreso: 0,
    descargadoEn: null,
    errorDescarga: null,
    createdAt: paquete.tema.creado_en ?? paquete.generado_en,
    updatedAt: paquete.tema.actualizado_en ?? paquete.generado_en,
    deletedAt: null,
    syncStatus: "synced",
  };

  const pasoLocalPorServerId = new Map<string, string>();
  const pasos: PasoLocal[] = paquete.pasos.map((paso) => {
    const localId = obtenerIdLocal(idsLocales, paso.id);
    pasoLocalPorServerId.set(paso.id, localId);
    return {
      localId,
      serverId: paso.id,
      temaLocalId: idTemaLocal,
      orden: paso.orden,
      obligatorio: paso.obligatorio,
      tipoPasoId: paso.tipo_paso?.id ?? null,
      tipoPasoCodigo: paso.tipo_paso?.codigo ?? null,
      tipoPasoNombre: paso.tipo_paso?.nombre ?? null,
      tipoPasoColorHex: paso.tipo_paso?.color_hex ?? null,
      contenidos: paso.contenidos.map((contenido) => ({
        id: contenido.id,
        grupoEdadId: contenido.grupo_edad_id,
        titulo: contenido.titulo,
        cuerpo: contenido.cuerpo,
        instruccionCorta: contenido.instruccion_corta,
        recursoId: contenido.recurso_id ?? null,
        recursoAudioId: contenido.recurso_audio_id ?? null,
        datosExtra: contenido.datos_extra ?? null,
      })),
      preguntas: paso.preguntas.map((pregunta) => ({
        id: pregunta.id,
        grupoEdadId: pregunta.grupo_edad_id,
        pregunta: pregunta.pregunta,
        orden: pregunta.orden,
      })),
      createdAt: contenidoFecha(paso.id, paquete.generado_en),
      updatedAt: contenidoFecha(paso.id, paquete.generado_en),
      deletedAt: null,
      syncStatus: "synced",
    };
  });

  const actividades: ActividadLocal[] = paquete.actividades.map((actividad) => ({
    localId: obtenerIdLocal(idsLocales, actividad.id),
    serverId: actividad.id,
    temaLocalId: idTemaLocal,
    pasoLocalId: actividad.paso_id ? pasoLocalPorServerId.get(actividad.paso_id) ?? null : null,
    grupoEdadId: actividad.grupo_edad_id,
    tipoActividadId: actividad.tipo_actividad_id,
    tipoActividadCodigo: actividad.tipo_actividad?.codigo ?? "",
    tipoActividadNombre: actividad.tipo_actividad?.nombre ?? "Actividad",
    tipoActividadDescripcion: actividad.tipo_actividad?.descripcion ?? null,
    tipoActividadEsJuego: actividad.tipo_actividad?.es_juego ?? false,
    titulo: actividad.titulo,
    consigna: actividad.consigna,
    orden: actividad.orden,
    xpRecompensa: actividad.xp_recompensa,
    dificultad: actividad.dificultad,
    limiteTiempoSeg: actividad.limite_tiempo_seg,
    obligatorio: actividad.obligatorio,
    retroalimentacion: actividad.retroalimentacion,
    configuracion: actividad.configuracion,
    opciones: actividad.opciones.map((opcion) => ({
      id: opcion.id,
      etiqueta: opcion.etiqueta,
      texto: opcion.texto,
      correcta: Boolean(opcion.correcta),
      orden: opcion.orden,
      retroalimentacion: opcion.retroalimentacion ?? null,
    })),
    createdAt: actividad.creado_en,
    updatedAt: actividad.actualizado_en,
    deletedAt: null,
    syncStatus: "synced",
  }));

  const medios = paquete.medios.map((medio) => ({
    serverId: medio.id,
    tipo: medio.tipo,
    urlOriginal: medio.url_descarga,
    urlLocal: construirRutaMediaOffline(medio.id),
    textoAlternativo: medio.texto_alternativo,
    tamanoBytes: medio.tamano_bytes,
    duracionSeg: medio.duracion_seg,
    anchoPx: medio.ancho_px,
    altoPx: medio.alto_px,
  }));

  return {
    tema,
    pasos,
    actividades,
    medios,
    tamanoMB: paquete.tamano_bytes / (1024 * 1024),
  };
}

function contenidoFecha(_id: string, fallback: string): string {
  return fallback;
}
