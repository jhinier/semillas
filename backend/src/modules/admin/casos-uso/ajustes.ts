import type { crearAdminRepository } from "../admin.repository";

type RepositorioAdmin = ReturnType<typeof crearAdminRepository>;

export function crearCasosUsoAjustes(repositorio: RepositorioAdmin) {
  return {
    obtener: () => repositorio.obtenerAjustesSistema(),
    actualizar: (
      body: Parameters<RepositorioAdmin["actualizarAjustesSistema"]>[0],
      actorId: string
    ) => repositorio.actualizarAjustesSistema(body, actorId)
  };
}
