import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  archivarClubAdmin,
  cerrarRetoClubAdmin,
  crearClubAdmin,
  crearRetoClubAdmin,
  expulsarMiembroClubAdmin,
  listarClubesAdmin,
  obtenerClubAdmin,
  reactivarClubAdmin,
  transferirLiderazgoClubAdmin,
} from "../admin-clubes.api";
import type {
  CrearClubAdminSolicitud,
  CrearRetoClubAdminSolicitud,
  FiltrosClubesAdmin,
} from "../admin-clubes.api";

type ClienteConectividadAdmin = Pick<QueryClient, "removeQueries">;

export function suscribirConectividadAdmin(
  clienteConsultas: ClienteConectividadAdmin,
  actualizarConexion: (conectado: boolean) => void,
) {
  const alDesconectarse = () => {
    actualizarConexion(false);
    clienteConsultas.removeQueries({ queryKey: ["admin", "clubes"] });
  };
  const alConectarse = () => actualizarConexion(true);

  window.addEventListener("offline", alDesconectarse);
  window.addEventListener("online", alConectarse);

  return () => {
    window.removeEventListener("offline", alDesconectarse);
    window.removeEventListener("online", alConectarse);
  };
}

export function useAdminClubes(filtros: FiltrosClubesAdmin, idClub?: string) {
  const clienteConsultas = useQueryClient();
  const [estaConectado, establecerConexion] = useState(() => navigator.onLine);

  useEffect(
    () => suscribirConectividadAdmin(clienteConsultas, establecerConexion),
    [clienteConsultas],
  );

  const listado = useQuery({
    queryKey: ["admin", "clubes", "listado", filtros],
    queryFn: async () => {
      try {
        return await listarClubesAdmin(filtros);
      } catch (error) {
        clienteConsultas.removeQueries({ queryKey: ["admin", "clubes", "listado", filtros], exact: true });
        throw error;
      }
    },
    enabled: estaConectado,
    retry: false,
  });

  const detalle = useQuery({
    queryKey: ["admin", "clubes", "detalle", idClub],
    queryFn: () => obtenerClubAdmin(idClub!),
    enabled: Boolean(idClub) && estaConectado,
    retry: false,
  });

  const invalidarClub = async (clubId?: string) => {
    const invalidaciones = [clienteConsultas.invalidateQueries({ queryKey: ["admin", "clubes"] })];
    if (clubId) {
      invalidaciones.push(clienteConsultas.invalidateQueries({ queryKey: ["admin", "clubes", "detalle", clubId] }));
    }
    await Promise.all(invalidaciones);
  };

  const crear = useMutation({
    mutationFn: (datos: CrearClubAdminSolicitud) => crearClubAdmin(datos),
    onSuccess: () => invalidarClub(),
  });
  const archivar = useMutation({
    mutationFn: archivarClubAdmin,
    onSuccess: (_resultado, clubId) => invalidarClub(clubId),
  });
  const reactivar = useMutation({
    mutationFn: reactivarClubAdmin,
    onSuccess: (_resultado, clubId) => invalidarClub(clubId),
  });
  const expulsarMiembro = useMutation({
    mutationFn: ({ clubId, usuarioId }: { clubId: string; usuarioId: string }) =>
      expulsarMiembroClubAdmin(clubId, usuarioId),
    onSuccess: (_resultado, { clubId }) => invalidarClub(clubId),
  });
  const transferirLiderazgo = useMutation({
    mutationFn: ({ clubId, usuarioId }: { clubId: string; usuarioId: string }) =>
      transferirLiderazgoClubAdmin(clubId, usuarioId),
    onSuccess: (_resultado, { clubId }) => invalidarClub(clubId),
  });
  const crearReto = useMutation({
    mutationFn: ({ clubId, datos }: { clubId: string; datos: CrearRetoClubAdminSolicitud }) =>
      crearRetoClubAdmin(clubId, datos),
    onSuccess: (_resultado, { clubId }) => invalidarClub(clubId),
  });
  const cerrarReto = useMutation({
    mutationFn: ({ clubId, retoId, motivo }: { clubId: string; retoId: string; motivo: string }) =>
      cerrarRetoClubAdmin(clubId, retoId, motivo),
    onSuccess: (_resultado, { clubId }) => invalidarClub(clubId),
  });

  return {
    estaConectado,
    listado: estaConectado ? listado : { ...listado, data: undefined },
    detalle: estaConectado ? detalle : { ...detalle, data: undefined },
    crear,
    archivar,
    reactivar,
    expulsarMiembro,
    transferirLiderazgo,
    crearReto,
    cerrarReto,
  };
}
