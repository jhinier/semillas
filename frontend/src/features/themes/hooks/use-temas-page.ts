import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { obtenerTemas, resolverGrupoCodigo } from "@/features/themes/themes.api";
import { obtenerMiProgreso } from "@/features/progress/progress.api";
import { obtenerMiPerfil } from "@/features/perfil/profile.api";
import { GRUPOS_EDAD_OFFLINE } from "@/features/catalog/catalog.api";
import { usePortadasFirmadas } from "@/features/themes/hooks/usePortadasFirmadas";
import { normalizarSenda } from "@/features/themes/componentes/senda-filter-row";
import { leerFavoritos, guardarFavoritos, mapearTema } from "@/features/themes/utils/temas-favorites.utils";
import type { TemaUI } from "@/features/themes/types";

type FiltroTab = "todos" | "completados" | "progreso" | "favoritos";
type SendaFiltro = "padre" | "hijo" | "espiritu";

type UseTemasPageOptions = {
  searchSenda?: SendaFiltro;
};

export function useTemasPage({ searchSenda }: UseTemasPageOptions = {}) {
  const navigate = useNavigate({ from: "/app/temas/" });
  const [filtroTab, setFiltroTab] = useState<FiltroTab>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [favoritosLocales, setFavoritosLocales] = useState<Record<string, boolean>>(leerFavoritos);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: obtenerMiPerfil,
    staleTime: 1000 * 60 * 3,
  });

  const grupoEdadId =
    meQuery.data?.perfil?.grupo_edad_id ||
    (typeof localStorage !== "undefined" ? localStorage.getItem("onboarding_grupo_edad_id") : null) ||
    undefined;

  const grupoEdadActivo = useMemo(() => {
    const grupos =
      meQuery.data?.grupos_edad && meQuery.data.grupos_edad.length > 0
        ? meQuery.data.grupos_edad
        : GRUPOS_EDAD_OFFLINE;

    const codigoGrupo = resolverGrupoCodigo(grupoEdadId);
    const encontrado = grupos.find(
      (g) => g.id === grupoEdadId || g.codigo === grupoEdadId || g.codigo === codigoGrupo,
    );

    if (encontrado) {
      const codigo = encontrado.codigo || codigoGrupo;
      const min =
        encontrado.edad_minima ??
        (encontrado as unknown as { edad_min?: number }).edad_min ??
        (codigo === "exploradores" ? 9 : codigo === "embajadores" ? 13 : 5);
      const max =
        encontrado.edad_maxima ??
        (encontrado as unknown as { edad_max?: number }).edad_max ??
        (codigo === "exploradores" ? 12 : codigo === "embajadores" ? 17 : 8);

      return {
        id: encontrado.id,
        codigo,
        nombre: encontrado.nombre || (codigo === "embajadores" ? "Embajadores" : codigo === "exploradores" ? "Exploradores" : "Semillas"),
        rango: `${min} a ${max} años`,
        enfoque:
          codigo === "embajadores"
            ? "Reflexión profunda, carácter y liderazgo"
            : codigo === "exploradores"
              ? "Retos bíblicos, descubrimientos y acción"
              : "Historias interactivas, canciones y juegos",
      };
    }

    if (codigoGrupo === "exploradores") {
      return {
        id: grupoEdadId ?? "exploradores",
        codigo: "exploradores",
        nombre: "Exploradores",
        rango: "9 a 12 años",
        enfoque: "Retos bíblicos, descubrimientos y acción",
      };
    }

    if (codigoGrupo === "embajadores") {
      return {
        id: grupoEdadId ?? "embajadores",
        codigo: "embajadores",
        nombre: "Embajadores",
        rango: "13 a 17 años",
        enfoque: "Reflexión profunda, carácter y liderazgo",
      };
    }

    return {
      id: grupoEdadId ?? "semillas",
      codigo: "semillas",
      nombre: "Semillas",
      rango: "5 a 8 años",
      enfoque: "Historias interactivas, canciones y juegos",
    };
  }, [grupoEdadId, meQuery.data?.grupos_edad]);

  const { data: temasApi, isLoading, isError } = useQuery({
    queryKey: ["temas", grupoEdadActivo.codigo],
    queryFn: () => obtenerTemas({ grupo_edad_id: grupoEdadActivo.id }),
    staleTime: 1000 * 60 * 3,
  });

  const { data: progressApi } = useQuery({
    queryKey: ["progress"],
    queryFn: obtenerMiProgreso,
    staleTime: 1000 * 60 * 2,
  });

  const toggleFavorito = useCallback((slug: string) => {
    setFavoritosLocales((prev) => {
      const nuevos = { ...prev, [slug]: !prev[slug] };
      guardarFavoritos(nuevos);
      return nuevos;
    });
  }, []);

  const temasBase = useMemo<TemaUI[]>(() => {
    if (!temasApi) return [];
    return temasApi.map((t) => {
      const progresoActual = progressApi?.progresos_tema?.find((p) => p.tema_id === t.id);
      const porcentaje = progresoActual ? progresoActual.porcentaje : 0;
      return {
        ...mapearTema(t, porcentaje),
        favorito: favoritosLocales[t.slug] ?? false,
        progresoTema: progresoActual
          ? {
              estado: progresoActual.estado,
              porcentaje: progresoActual.porcentaje,
              ultimoPasoId: progresoActual.ultimo_paso_id,
            }
          : null,
      };
    });
  }, [temasApi, favoritosLocales, progressApi]);

  const portadas = usePortadasFirmadas(temasApi ?? []);

  const temasConPortadas = useMemo<TemaUI[]>(
    () => temasBase.map((t) => ({ ...t, imagenUrl: portadas.get(t.id) ?? null })),
    [temasBase, portadas],
  );

  const { temasFiltrados, stats, temaParaContinuar, temaRecomendado } = useMemo(() => {
    const filtrados = temasConPortadas.filter((tema) => {
      const cumpleBusqueda =
        tema.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        tema.descripcion.toLowerCase().includes(busqueda.toLowerCase());

      const cumpleTab =
        filtroTab === "todos" ||
        (filtroTab === "completados" && tema.estado === "completada") ||
        (filtroTab === "progreso" && tema.estado === "enProgreso") ||
        (filtroTab === "favoritos" && tema.favorito);

      const cumpleSenda = !searchSenda || normalizarSenda(tema.senda) === searchSenda;

      return cumpleBusqueda && cumpleTab && cumpleSenda;
    });

    return {
      temasFiltrados: filtrados,
      stats: {
        totales: temasConPortadas.length,
        completados: temasConPortadas.filter((t) => t.estado === "completada").length,
        enProgreso: temasConPortadas.filter((t) => t.estado === "enProgreso").length,
        favoritos: temasConPortadas.filter((t) => t.favorito).length,
      },
      temaParaContinuar: temasConPortadas.find((t) => t.estado === "enProgreso"),
      temaRecomendado: temasConPortadas.find((t) => t.estado === "porDefecto"),
    };
  }, [temasConPortadas, filtroTab, busqueda, searchSenda]);

  const cambiarSenda = useCallback(
    (s: SendaFiltro | "todas") => {
      navigate({
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          sendas: s === "todas" ? undefined : s,
        }),
      });
    },
    [navigate],
  );

  return {
    temasApi,
    temasFiltrados,
    stats,
    temaParaContinuar,
    temaRecomendado,
    grupoEdadActivo,
    isLoading,
    isError,
    filtroTab,
    setFiltroTab,
    busqueda,
    setBusqueda,
    toggleFavorito,
    cambiarSenda,
  };
}
