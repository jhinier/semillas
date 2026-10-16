import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import {
  obtenerActividadesAdmin,
  obtenerTemasAdmin,
  type ActividadAdmin,
} from "../admin.api";
import { obtenerSendas } from "@/features/sendas/sendas.api";
import { obtenerGruposEdad, obtenerTiposActividad } from "@/features/catalog/catalog.api";

export type ActivityLibraryStatus = "todas" | "publicada" | "revision" | "borrador";

export function useAdminActivities() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedTemaId, setSelectedTemaId] = useState("");
  const [selectedSendaId, setSelectedSendaId] = useState("");
  const [selectedAgeGroupId, setSelectedAgeGroupId] = useState("");
  const [selectedTypeCode, setSelectedTypeCode] = useState("");
  const [activeStatus, setActiveStatus] = useState<ActivityLibraryStatus>("todas");
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  const activitiesQuery = useQuery({
    queryKey: ["admin", "activities", "library"],
    queryFn: () => obtenerActividadesAdmin({ limit: 500 }),
  });
  const temasQuery = useQuery({
    queryKey: ["admin", "themes"],
    queryFn: () => obtenerTemasAdmin(),
  });
  const sendasQuery = useQuery({
    queryKey: ["sendas"],
    queryFn: obtenerSendas,
    staleTime: 1000 * 60 * 60,
  });
  const ageGroupsQuery = useQuery({
    queryKey: ["catalog", "age-groups"],
    queryFn: obtenerGruposEdad,
    staleTime: 1000 * 60 * 60,
  });
  const activityTypesQuery = useQuery({
    queryKey: ["catalog", "activity-types"],
    queryFn: obtenerTiposActividad,
    staleTime: 1000 * 60 * 60,
  });

  const allActivities = activitiesQuery.data?.actividades ?? [];
  const temasBase = temasQuery.data ?? [];
  const sendasBase = sendasQuery.data ?? [];
  const ageGroupsBase = ageGroupsQuery.data ?? [];
  const activityTypesBase = activityTypesQuery.data ?? [];

  const filteredActivities = useMemo(() => {
    const query = searchValue.trim().toLocaleLowerCase("es");
    return allActivities.filter((activity) => {
      if (activeStatus !== "todas" && activity.estado !== activeStatus) return false;
      if (selectedTemaId && activity.tema_id !== selectedTemaId) return false;
      if (selectedSendaId && activity.tema?.senda?.id !== selectedSendaId) return false;
      if (selectedAgeGroupId && activity.grupo_edad_id !== selectedAgeGroupId) return false;
      if (selectedTypeCode && activity.tipo_actividad?.codigo !== selectedTypeCode) return false;
      if (!query) return true;

      return [
        activity.titulo,
        activity.consigna,
        activity.tema?.titulo,
        activity.tipo_actividad?.nombre,
        activity.grupo_edad?.nombre,
      ].some((value) => value?.toLocaleLowerCase("es").includes(query));
    });
  }, [
    activeStatus,
    allActivities,
    searchValue,
    selectedAgeGroupId,
    selectedSendaId,
    selectedTemaId,
    selectedTypeCode,
  ]);

  useEffect(() => {
    setPaginaActual(1);
  }, [activeStatus, searchValue, selectedAgeGroupId, selectedSendaId, selectedTemaId, selectedTypeCode, porPagina]);

  const paginatedActivities = useMemo(() => {
    const start = (paginaActual - 1) * porPagina;
    return filteredActivities.slice(start, start + porPagina);
  }, [filteredActivities, paginaActual, porPagina]);

  const statusCounts = useMemo(() => {
    return allActivities.reduce(
      (counts, activity) => {
        counts.todas += 1;
        if (activity.estado === "publicada") counts.publicada += 1;
        else if (activity.estado === "revision") counts.revision += 1;
        else counts.borrador += 1;
        return counts;
      },
      { todas: 0, publicada: 0, revision: 0, borrador: 0 },
    );
  }, [allActivities]);

  const typeCounts = useMemo(() => {
    return allActivities.reduce<Record<string, number>>((counts, activity) => {
      const code = activity.tipo_actividad?.codigo ?? "sin_tipo";
      counts[code] = (counts[code] ?? 0) + 1;
      return counts;
    }, {});
  }, [allActivities]);

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / porPagina));
  useEffect(() => {
    if (paginaActual > totalPages) setPaginaActual(totalPages);
  }, [paginaActual, totalPages]);

  const clearFilters = () => {
    setSearchValue("");
    setSelectedTemaId("");
    setSelectedSendaId("");
    setSelectedAgeGroupId("");
    setSelectedTypeCode("");
    setActiveStatus("todas");
  };

  const hasFilters = Boolean(
    searchValue || selectedTemaId || selectedSendaId || selectedAgeGroupId || selectedTypeCode || activeStatus !== "todas",
  );

  return {
    searchValue,
    setSearchValue,
    selectedTemaId,
    setSelectedTemaId,
    selectedSendaId,
    setSelectedSendaId,
    selectedAgeGroupId,
    setSelectedAgeGroupId,
    selectedTypeCode,
    setSelectedTypeCode,
    activeStatus,
    setActiveStatus,
    paginaActual,
    setPaginaActual,
    porPagina,
    setPorPagina,
    isLoading:
      activitiesQuery.isLoading ||
      temasQuery.isLoading ||
      sendasQuery.isLoading ||
      ageGroupsQuery.isLoading ||
      activityTypesQuery.isLoading,
    isError: activitiesQuery.isError,
    activities: paginatedActivities,
    allFilteredActivities: filteredActivities,
    filteredTotal: filteredActivities.length,
    totalPages,
    statusCounts,
    typeCounts,
    clearFilters,
    hasFilters,
    temasBase,
    sendasBase,
    ageGroupsBase,
    activityTypesBase,
  };
}

export function getActivityLibraryStatus(activity: ActividadAdmin) {
  return activity.estado === "publicada" || activity.estado === "revision" ? activity.estado : "borrador";
}
