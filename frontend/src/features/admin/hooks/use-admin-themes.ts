import { useQuery, useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { obtenerTemasAdmin, publicarTema, despublicarTema } from "../admin.api";
import { obtenerUrlPortadaTema } from "@/features/themes/themes.api";
import { obtenerSendas } from "@/features/sendas/sendas.api";
import { obtenerGruposEdad } from "@/features/catalog/catalog.api";
import { mapearTemaParaTabla, filtrarTemas, contarTemasPorEstado } from "./temas-table.helpers";
import type { Tema } from "@/shared/api/api";

function usePortadasFirmadas(temas: Tema[]) {
  return useQueries({
    queries: temas.map((t) => ({
      queryKey: ["theme-portada", t.id],
      queryFn: () => obtenerUrlPortadaTema(t.id),
      enabled: Boolean(t.portada_recurso_id || t.portada_recurso?.id),
      staleTime: 10 * 60 * 1000,
      gcTime: 11 * 60 * 1000,
    })),
    combine: (results) => {
      const mapa = new Map<string, string | null>();
      temas.forEach((t, index) => {
        const resultado = results[index]?.data;
        mapa.set(t.id, resultado?.url ?? null);
      });
      return mapa;
    }
  });
}

export function useAdminThemes() {
  const queryClient = useQueryClient();

  const [searchValue, setSearchValue] = useState("");
  const [selectedSendaId, setSelectedSendaId] = useState("");
  const [selectedAgeGroupId, setSelectedAgeGroupId] = useState("");
  const [activeTab, setActiveTab] = useState("todos");

  const temasQuery = useQuery({ queryKey: ["admin", "themes"], queryFn: () => obtenerTemasAdmin() });
  const sendasQuery = useQuery({ queryKey: ["sendas"], queryFn: obtenerSendas, staleTime: 1000 * 60 * 60 });
  const ageGroupsQuery = useQuery({ queryKey: ["catalog", "age-groups"], queryFn: obtenerGruposEdad, staleTime: 1000 * 60 * 60 });

  const temasBase = temasQuery.data ?? [];
  const portadas = usePortadasFirmadas(temasBase);

  const publishMutation = useMutation({
    mutationFn: publicarTema,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "themes"] });
      queryClient.invalidateQueries({ queryKey: ["themes"] });
    }
  });

  const unpublishMutation = useMutation({
    mutationFn: despublicarTema,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "themes"] });
      queryClient.invalidateQueries({ queryKey: ["themes"] });
    }
  });

  const mappedThemes = useMemo(
    () => temasBase.map((t) => mapearTemaParaTabla(t, sendasQuery.data, portadas.get(t.id) ?? null)),
    [temasBase, portadas, sendasQuery.data],
  );

  const filteredThemes = useMemo(
    () => filtrarTemas(mappedThemes, { activeTab, searchValue, selectedSendaId, selectedAgeGroupId, sendasData: sendasQuery.data, ageGroupsData: ageGroupsQuery.data }),
    [mappedThemes, activeTab, searchValue, selectedSendaId, selectedAgeGroupId, sendasQuery.data, ageGroupsQuery.data],
  );

  const tabCounts = useMemo(() => contarTemasPorEstado(mappedThemes), [mappedThemes]);
  const filterSendas = useMemo(() => (sendasQuery.data ?? []).map((s) => ({ id: s.id, nombre: s.nombre })), [sendasQuery.data]);
  const filterAgeGroups = useMemo(() => (ageGroupsQuery.data ?? []).map((g) => ({ id: g.id, nombre: g.nombre })), [ageGroupsQuery.data]);

  return {
    searchValue, setSearchValue,
    selectedSendaId, setSelectedSendaId,
    selectedAgeGroupId, setSelectedAgeGroupId,
    activeTab, setActiveTab,
    isLoading: temasQuery.isLoading,
    temasBase,
    mappedThemes, filteredThemes, tabCounts,
    filterSendas, filterAgeGroups,
    publishMutation, unpublishMutation,
  };
}
