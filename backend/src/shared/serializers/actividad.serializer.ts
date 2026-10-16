export type FilaActividad = {
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
  tipo_actividad?: {
    id: string;
    codigo: string;
    nombre: string;
    descripcion: string | null;
    es_juego: boolean;
    activo: boolean;
    creado_en: string;
  } | null;
  opciones?: Array<{
    id: string;
    actividad_id: string;
    etiqueta: string | null;
    texto: string;
    correcta: boolean;
    orden: number;
    retroalimentacion: string | null;
  }> | null;
};

function serializarTipoActividad(tipoActividad: NonNullable<FilaActividad["tipo_actividad"]>) {
  return {
    id: tipoActividad.id,
    codigo: tipoActividad.codigo,
    nombre: tipoActividad.nombre,
    descripcion: tipoActividad.descripcion,
    es_juego: tipoActividad.es_juego,
    activo: tipoActividad.activo,
    creado_en: tipoActividad.creado_en
  };
}

function serializarOpcionActividad(opcion: NonNullable<NonNullable<FilaActividad["opciones"]>[number]>) {
  return {
    id: opcion.id,
    actividad_id: opcion.actividad_id,
    etiqueta: opcion.etiqueta,
    texto: opcion.texto,
    orden: opcion.orden
  };
}

export function serializarActividad(fila: FilaActividad) {
  const opciones = (fila.opciones ?? []).slice().sort((a, b) => a.orden - b.orden);

  return {
    id: fila.id,
    tema_id: fila.tema_id,
    paso_id: fila.paso_id,
    grupo_edad_id: fila.grupo_edad_id,
    tipo_actividad_id: fila.tipo_actividad_id,
    titulo: fila.titulo,
    consigna: fila.consigna,
    orden: fila.orden,
    xp_recompensa: fila.xp_recompensa,
    dificultad: fila.dificultad,
    limite_tiempo_seg: fila.limite_tiempo_seg,
    obligatorio: fila.obligatorio,
    retroalimentacion: fila.retroalimentacion,
    configuracion: fila.configuracion,
    creado_en: fila.creado_en,
    actualizado_en: fila.actualizado_en,
    tipo_actividad: fila.tipo_actividad ? serializarTipoActividad(fila.tipo_actividad) : null,
    opciones: opciones.map(serializarOpcionActividad)
  };
}
