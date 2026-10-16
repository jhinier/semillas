import { serializarProgresoActividad, serializarProgresoTema } from "../../../shared/serializers/progreso.serializer";
import type { ProgressRepository } from "../progress.repository";

type Dependencias = { progreso: ProgressRepository };

export function crearCasoObtenerMiProgreso({ progreso }: Dependencias) {
  return async function obtenerMiProgreso(usuarioId: string) {
    const { themes, activities } = await progreso.obtenerProgresoPropio(usuarioId);

    return {
      progresos_tema: themes.map((tema) =>
        serializarProgresoTema({
          usuario_id: tema.usuarioId,
          tema_id: tema.temaId,
          estado: tema.estado,
          porcentaje: tema.porcentaje,
          iniciado_en: tema.iniciadoEn ? tema.iniciadoEn.toISOString() : null,
          completado_en: tema.completadoEn ? tema.completadoEn.toISOString() : null,
          ultimo_paso_id: tema.ultimoPasoId,
          actualizado_en: tema.actualizadoEn.toISOString()
        })
      ),
      progresos_actividad: activities.map((actividad) =>
        serializarProgresoActividad({
          usuario_id: actividad.usuarioId,
          actividad_id: actividad.actividadId,
          intentos: actividad.intentos,
          mejor_puntaje: actividad.mejorPuntaje,
          completado: actividad.completado,
          completado_en: actividad.completadoEn ? actividad.completadoEn.toISOString() : null,
          actualizado_en: actividad.actualizadoEn.toISOString()
        })
      )
    };
  };
}
