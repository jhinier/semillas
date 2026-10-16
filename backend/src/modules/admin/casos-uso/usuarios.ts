import type { AdminUsersRepository } from "../admin-users.repository";

export function crearCasosUsoUsuarios(repositorio: AdminUsersRepository) {
  return {
    listar: (params: Parameters<AdminUsersRepository["listarUsuarios"]>[0]) =>
      repositorio.listarUsuarios(params),
    obtener: (usuarioId: string) => repositorio.obtenerUsuario(usuarioId),
    actualizar: (
      usuarioId: string,
      body: Parameters<AdminUsersRepository["actualizarUsuario"]>[1],
      actorId: string
    ) => repositorio.actualizarUsuario(usuarioId, body, actorId),
    invitar: (
      body: Parameters<AdminUsersRepository["invitarUsuario"]>[0],
      actorId: string
    ) => repositorio.invitarUsuario(body, actorId),
    crearMenor: (
      body: Parameters<AdminUsersRepository["crearMenor"]>[0],
      actorId: string
    ) => repositorio.crearMenor(body, actorId),
    accionMasiva: (
      body: Parameters<AdminUsersRepository["accionMasiva"]>[0],
      actorId: string
    ) => repositorio.accionMasiva(body, actorId),
    eliminar: (usuarioId: string, actorId: string) =>
      repositorio.eliminarUsuario(usuarioId, actorId)
  };
}
