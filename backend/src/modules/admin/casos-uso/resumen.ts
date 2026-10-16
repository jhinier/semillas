import type { crearAdminRepository } from "../admin.repository";

type RepositorioAdmin = ReturnType<typeof crearAdminRepository>;

export function crearCasoObtenerResumen(repositorio: RepositorioAdmin) {
  return {
    ejecutar: () => repositorio.obtenerResumen(),
    ejecutarDetallado: () => repositorio.obtenerResumenDetallado(),
  };
}
