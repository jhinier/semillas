import {
  serializarEventoSincronizacion,
  serializarProgresoActividadSincronizacion,
  serializarProgresoTemaSincronizacion,
  type FilaEventoSincronizacion,
  type FilaProgresoActividadSincronizacion,
  type FilaProgresoTemaSincronizacion
} from "../sync.serializer";
import type { SyncRepository } from "../sync.repository";

type Dependencias = {
  repositorio: SyncRepository;
};

export function crearCasoObtenerSyncPull({ repositorio }: Dependencias) {
  return async function obtenerSyncPull(usuarioId: string, since?: string) {
    const [eventos, progresoTemas, progresoActividades] = await Promise.all([
      repositorio.listarEventosUsuario(usuarioId, since),
      repositorio.listarProgresoTemas(usuarioId),
      repositorio.listarProgresoActividades(usuarioId)
    ]);

    return {
      timestamp_servidor: new Date().toISOString(),
      eventos: eventos.map((fila) => serializarEventoSincronizacion(fila as FilaEventoSincronizacion)),
      progreso: {
        temas: progresoTemas.map((fila) => serializarProgresoTemaSincronizacion(fila as FilaProgresoTemaSincronizacion)),
        actividades: progresoActividades.map((fila) =>
          serializarProgresoActividadSincronizacion(fila as FilaProgresoActividadSincronizacion)
        )
      }
    };
  };
}
