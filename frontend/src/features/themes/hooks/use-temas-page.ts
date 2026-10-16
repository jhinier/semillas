import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { obtenerTemas } from "@/features/themes/themes.api";
import { obtenerMiProgreso } from "@/features/progress/progress.api";
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

  const { data: temasApi, isLoading, isError } = useQuery({
    queryKey: ["temas"],
    queryFn: () => obtenerTemas(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: progressApi } = useQuery({
    queryKey: ["progress"],
    queryFn: obtenerMiProgreso,
    staleTime: 1000 * 60 * 3,
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
