import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarClubAdmin,
  agregarMiembroClubAdmin,
  archivarClubAdmin,
  cerrarRetoClubAdmin,
  crearRetoClubAdmin,
  expulsarMiembroClubAdmin,
  obtenerClubAdmin,
  reactivarClubAdmin,
  regenerarCodigoClubAdmin,
  transferirLiderazgoClubAdmin,
} from "../admin-clubes.api";
import type { ActualizarClubAdminSolicitud, CrearRetoClubAdminSolicitud } from "../admin-clubes.api";

export function useAdminClubDetail(clubId: string) {
  const cliente = useQueryClient();
  const detalle = useQuery({
    queryKey: ["admin", "clubes", "detalle", clubId],
    queryFn: () => obtenerClubAdmin(clubId),
    enabled: Boolean(clubId),
    retry: false,
  });

  const invalidar = async () => {
    await Promise.all([
      cliente.invalidateQueries({ queryKey: ["admin", "clubes", "detalle", clubId] }),
      cliente.invalidateQueries({ queryKey: ["admin", "clubes", "listado"] }),
    ]);
  };

  const actualizar = useMutation({
    mutationFn: (datos: ActualizarClubAdminSolicitud) => actualizarClubAdmin(clubId, datos),
    onSuccess: invalidar,
  });
  const agregarMiembro = useMutation({
    mutationFn: (usuarioId: string) => agregarMiembroClubAdmin(clubId, usuarioId),
    onSuccess: invalidar,
  });
  const expulsarMiembro = useMutation({
    mutationFn: (usuarioId: string) => expulsarMiembroClubAdmin(clubId, usuarioId),
    onSuccess: invalidar,
  });
  const transferirLiderazgo = useMutation({
    mutationFn: (usuarioId: string) => transferirLiderazgoClubAdmin(clubId, usuarioId),
    onSuccess: invalidar,
  });
  const crearReto = useMutation({
    mutationFn: (datos: CrearRetoClubAdminSolicitud) => crearRetoClubAdmin(clubId, datos),
    onSuccess: invalidar,
  });
  const cerrarReto = useMutation({
    mutationFn: ({ retoId, motivo }: { retoId: string; motivo: string }) => cerrarRetoClubAdmin(clubId, retoId, motivo),
    onSuccess: invalidar,
  });
  const archivar = useMutation({
    mutationFn: () => archivarClubAdmin(clubId),
    onSuccess: invalidar,
  });
  const reactivar = useMutation({
    mutationFn: () => reactivarClubAdmin(clubId),
    onSuccess: invalidar,
  });
  const regenerarCodigo = useMutation({
    mutationFn: () => regenerarCodigoClubAdmin(clubId),
    onSuccess: invalidar,
  });

  const mutando =
    actualizar.isPending ||
    agregarMiembro.isPending ||
    expulsarMiembro.isPending ||
    transferirLiderazgo.isPending ||
    crearReto.isPending ||
    cerrarReto.isPending ||
    archivar.isPending ||
    reactivar.isPending ||
    regenerarCodigo.isPending;

  return {
    detalle,
    actualizar,
    agregarMiembro,
    expulsarMiembro,
    transferirLiderazgo,
    crearReto,
    cerrarReto,
    archivar,
    reactivar,
    regenerarCodigo,
    mutando,
  };
}
