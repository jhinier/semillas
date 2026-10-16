import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import avatar1 from "@/assets/images/avatars/Avatar 1.webp";
import avatar2 from "@/assets/images/avatars/Avatar 2.webp";
import avatar3 from "@/assets/images/avatars/Avatar 3.webp";
import avatar4 from "@/assets/images/avatars/Avatar 4.webp";
import avatar5 from "@/assets/images/avatars/Avatar 5.webp";
import avatar6 from "@/assets/images/avatars/Avatar 6.webp";
import avatar7 from "@/assets/images/avatars/Avatar 7.webp";
import avatar8 from "@/assets/images/avatars/Avatar 8.webp";
import avatar9 from "@/assets/images/avatars/Avatar 9.webp";
import avatar10 from "@/assets/images/avatars/Avatar 10.webp";
import {
  obtenerUsuariosAdmin,
  type EstadoUsuarioAdmin,
  type UsuarioAdmin,
} from "../admin.api";

const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8, avatar9, avatar10];

function indiceAvatar(id: string) {
  let hash = 0;
  for (const caracter of id) hash = (hash * 31 + caracter.charCodeAt(0)) >>> 0;
  return hash % avatars.length;
}

export function avatarUsuario(usuario: Pick<UsuarioAdmin, "id" | "perfil">) {
  return usuario.perfil?.avatar_url || avatars[indiceAvatar(usuario.id)]!;
}

export function etiquetaRol(rol: UsuarioAdmin["rol"]) {
  return {
    administrador: "Administrador",
    padre: "Padre/Madre",
    usuario: "Estudiante",
    invitado: "Invitado",
  }[rol];
}

export function etiquetaUltimoAcceso(fecha: string | null) {
  if (!fecha) return "Nunca";
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return "Sin registro";
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(valor);
}

export function useAdminUsers() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedRol, setSelectedRol] = useState("");
  const [selectedFranja, setSelectedFranja] = useState("");
  const [selectedEstado, setSelectedEstado] = useState<EstadoUsuarioAdmin | "">("");
  const [selectedClub, setSelectedClub] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  const busquedaDiferida = useDeferredValue(searchValue.trim());
  const offset = (paginaActual - 1) * porPagina;

  const usersQuery = useQuery({
    queryKey: [
      "admin",
      "users",
      busquedaDiferida,
      selectedRol,
      selectedFranja,
      selectedEstado,
      selectedClub,
      porPagina,
      offset,
    ],
    queryFn: () =>
      obtenerUsuariosAdmin({
        q: busquedaDiferida || undefined,
        rol: selectedRol || undefined,
        grupo_edad_id: selectedFranja || undefined,
        estado: selectedEstado || undefined,
        club_id: selectedClub || undefined,
        limit: porPagina,
        offset,
      }),
    placeholderData: (anterior) => anterior,
  });

  const usuarios = usersQuery.data?.usuarios ?? [];
  const total = usersQuery.data?.total ?? 0;

  const idsPagina = useMemo(() => usuarios.map((usuario) => usuario.id), [usuarios]);
  const todosSeleccionados =
    idsPagina.length > 0 && idsPagina.every((id) => seleccionados.has(id));

  function cambiarFiltro(setter: (valor: string) => void, valor: string) {
    setter(valor);
    setPaginaActual(1);
    setSeleccionados(new Set());
  }

  function toggleUsuario(usuarioId: string) {
    setSeleccionados((actuales) => {
      const siguientes = new Set(actuales);
      if (siguientes.has(usuarioId)) siguientes.delete(usuarioId);
      else siguientes.add(usuarioId);
      return siguientes;
    });
  }

  function togglePagina() {
    setSeleccionados((actuales) => {
      const siguientes = new Set(actuales);
      if (todosSeleccionados) idsPagina.forEach((id) => siguientes.delete(id));
      else idsPagina.forEach((id) => siguientes.add(id));
      return siguientes;
    });
  }

  function clearFilters() {
    setSearchValue("");
    setSelectedRol("");
    setSelectedFranja("");
    setSelectedEstado("");
    setSelectedClub("");
    setPaginaActual(1);
    setSeleccionados(new Set());
  }

  function cambiarPorPagina(cantidad: number) {
    setPorPagina(cantidad);
    setPaginaActual(1);
    setSeleccionados(new Set());
  }

  return {
    searchValue,
    setSearchValue: (valor: string) => cambiarFiltro(setSearchValue, valor),
    selectedRol,
    setSelectedRol: (valor: string) => cambiarFiltro(setSelectedRol, valor),
    selectedFranja,
    setSelectedFranja: (valor: string) => cambiarFiltro(setSelectedFranja, valor),
    selectedEstado,
    setSelectedEstado: (valor: string) =>
      cambiarFiltro(
        setSelectedEstado as (valor: string) => void,
        valor
      ),
    selectedClub,
    setSelectedClub: (valor: string) => cambiarFiltro(setSelectedClub, valor),
    paginaActual,
    setPaginaActual,
    porPagina,
    setPorPagina: cambiarPorPagina,
    isLoading: usersQuery.isLoading,
    isFetching: usersQuery.isFetching,
    isError: usersQuery.isError,
    error: usersQuery.error,
    refetch: usersQuery.refetch,
    usuarios,
    total,
    resumen: usersQuery.data?.resumen ?? {
      total: 0,
      activos: 0,
      pendientes: 0,
      bloqueados: 0,
      administradores: 0,
      padres: 0,
    },
    catalogos: usersQuery.data?.catalogos ?? {
      grupos_edad: [],
      clubes: [],
      tutores: [],
    },
    seleccionados,
    seleccionadosIds: [...seleccionados],
    todosSeleccionados,
    toggleUsuario,
    togglePagina,
    limpiarSeleccion: () => setSeleccionados(new Set()),
    clearFilters,
    tieneFiltros: Boolean(
      searchValue ||
        selectedRol ||
        selectedFranja ||
        selectedEstado ||
        selectedClub
    ),
  };
}
