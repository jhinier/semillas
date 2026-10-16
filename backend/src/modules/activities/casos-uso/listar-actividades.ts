import { serializarActividad } from "../../../shared/serializers/actividad.serializer";
import type { ActivitiesRepository } from "../activities.repository";

type Dependencias = {
  actividades: ActivitiesRepository;
};

function serializarActividadDesdeRepo(
  actividad: Awaited<ReturnType<ActivitiesRepository["listarActividades"]>>["actividades"][number],
  tipoActividad: Awaited<ReturnType<ActivitiesRepository["listarActividades"]>>["tipos"][number] | null,
  opciones: Awaited<ReturnType<ActivitiesRepository["listarActividades"]>>["opciones"]
) {
  return serializarActividad({
    id: actividad.id,
    tema_id: actividad.temaId,
    paso_id: actividad.pasoId,
    grupo_edad_id: actividad.grupoEdadId,
    tipo_actividad_id: actividad.tipoActividadId,
    titulo: actividad.titulo,
    consigna: actividad.consigna,
    orden: actividad.orden,
    xp_recompensa: actividad.xpRecompensa,
    dificultad: actividad.dificultad,
    limite_tiempo_seg: actividad.limiteTiempoSeg,
    obligatorio: actividad.obligatorio,
    retroalimentacion: actividad.retroalimentacion,
    configuracion: (actividad.configuracion ?? {}) as Record<string, unknown>,
    creado_en: actividad.creadoEn.toISOString(),
    actualizado_en: actividad.actualizadoEn.toISOString(),
    tipo_actividad: tipoActividad
      ? {
          id: tipoActividad.id,
          codigo: tipoActividad.codigo,
          nombre: tipoActividad.nombre,
          descripcion: tipoActividad.descripcion,
          es_juego: tipoActividad.esJuego,
          activo: tipoActividad.activo,
          creado_en: tipoActividad.creadoEn.toISOString()
        }
      : null,
    opciones: opciones
      .filter((opcion) => opcion.actividadId === actividad.id)
      .map((opcion) => ({
        id: opcion.id,
        actividad_id: opcion.actividadId,
        etiqueta: opcion.etiqueta,
        texto: opcion.texto,
        correcta: opcion.correcta,
        orden: opcion.orden,
        retroalimentacion: opcion.retroalimentacion
      }))
  });
}

export function crearCasoListarActividades({ actividades }: Dependencias) {
  return async function listarActividades() {
    const { actividades: filas, tipos, opciones } = await actividades.listarActividades();
    const tipoPorId = new Map(tipos.map((tipo) => [tipo.id, tipo]));

    return filas.map((actividad) =>
      serializarActividadDesdeRepo(actividad, tipoPorId.get(actividad.tipoActividadId) ?? null, opciones)
    );
  };
}
