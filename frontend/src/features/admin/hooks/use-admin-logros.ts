import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  archivarLogroAdmin,
  actualizarLogroAdmin,
  crearLogroAdmin,
  listarLogrosAdmin,
  obtenerLogroAdmin,
  reactivarLogroAdmin,
} from "../admin-logros.api";
import type {
  ActualizarLogroAdminSolicitud,
  CrearLogroAdminSolicitud,
  FiltrosLogrosAdmin,
} from "../admin-logros.api";

type ClienteConectividad = Pick<QueryClient, "removeQueries">;

export function suscribirConectividadLogros(
  clienteConsultas: ClienteConectividad,
  actualizarConexion: (conectado: boolean) => void,
) {
  const alDesconectarse = () => {
    actualizarConexion(false);
    clienteConsultas.removeQueries({ queryKey: ["admin", "logros"] });
  };
  const alConectarse = () => actualizarConexion(true);

  window.addEventListener("offline", alDesconectarse);
  window.addEventListener("online", alConectarse);

  return () => {
    window.removeEventListener("offline", alDesconectarse);
    window.removeEventListener("online", alConectarse);
  };
}

export function useAdminLogros(filtros: FiltrosLogrosAdmin, idLogro?: string) {
  const clienteConsultas = useQueryClient();
  const [estaConectado, establecerConexion] = useState(() => navigator.onLine);

  useEffect(
    () => suscribirConectividadLogros(clienteConsultas, establecerConexion),
    [clienteConsultas],
  );

  const listado = useQuery({
    queryKey: ["admin", "logros", "listado", filtros],
    queryFn: async () => {
      try {
        return await listarLogrosAdmin(filtros);
      } catch (error) {
        clienteConsultas.removeQueries({ queryKey: ["admin", "logros", "listado", filtros], exact: true });
        throw error;
      }
    },
    enabled: estaConectado,
    retry: false,
  });

  const detalle = useQuery({
    queryKey: ["admin", "logros", "detalle", idLogro],
    queryFn: () => obtenerLogroAdmin(idLogro!),
    enabled: Boolean(idLogro) && estaConectado,
    retry: false,
  });

  const invalidar = async (id?: string) => {
    const invalidaciones = [clienteConsultas.invalidateQueries({ queryKey: ["admin", "logros"] })];
    if (id) {
      invalidaciones.push(clienteConsultas.invalidateQueries({ queryKey: ["admin", "logros", "detalle", id] }));
    }
    await Promise.all(invalidaciones);
  };

  const crear = useMutation({
    mutationFn: (datos: CrearLogroAdminSolicitud) => crearLogroAdmin(datos),
    onSuccess: (resultado) => invalidar(resultado.id),
  });

  const actualizar = useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: ActualizarLogroAdminSolicitud }) =>
      actualizarLogroAdmin(id, datos),
    onSuccess: (_resultado, { id }) => invalidar(id),
  });

  const archivar = useMutation({
    mutationFn: archivarLogroAdmin,
    onSuccess: (_resultado, id) => invalidar(id),
  });

  const reactivar = useMutation({
    mutationFn: reactivarLogroAdmin,
    onSuccess: (_resultado, id) => invalidar(id),
  });

  return {
    estaConectado,
    listado: estaConectado ? listado : { ...listado, data: undefined },
    detalle: estaConectado ? detalle : { ...detalle, data: undefined },
    crear,
    actualizar,
    archivar,
    reactivar,
    mutando:
      crear.isPending || actualizar.isPending || archivar.isPending || reactivar.isPending,
  };
}