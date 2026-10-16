import type { crearAdminRepository } from "../admin.repository";

type RepositorioAdmin = ReturnType<typeof crearAdminRepository>;

export function crearCasosUsoActividades(repositorio: RepositorioAdmin) {
  return {
    listar: (filtros: Parameters<RepositorioAdmin["listarActividades"]>[0]) => repositorio.listarActividades(filtros),
    obtener: (actividadId: string) => repositorio.obtenerActividad(actividadId),
    crear: (body: Parameters<RepositorioAdmin["crearActividad"]>[0]) => repositorio.crearActividad(body),
    actualizar: (actividadId: string, body: Parameters<RepositorioAdmin["actualizarActividad"]>[1]) => repositorio.actualizarActividad(actividadId, body),
    eliminar: (actividadId: string) => repositorio.borrarActividad(actividadId),
    duplicar: (actividadId: string) => repositorio.duplicarActividad(actividadId),
    reordenar: (temaId: string, body: Parameters<RepositorioAdmin["reordenarActividades"]>[1]) => repositorio.reordenarActividades(temaId, body),
  };
}
