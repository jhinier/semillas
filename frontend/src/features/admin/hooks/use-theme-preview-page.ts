import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import {
  obtenerActividadesAdmin,
  obtenerPasosAdmin,
  obtenerTemaAdmin,
  type ActividadAdmin,
} from "@/features/admin/admin.api";
import {
  resolverPortadaTemaAdmin,
  usePortadasFirmadasAdmin,
} from "@/features/admin/admin-theme-cover";
import { obtenerEstadoTema } from "@/features/admin/componentes/temas/theme-view.utils";
import type { Paso } from "@/shared/api/api";

export type ThemePreviewMode = "overview" | "lesson";

type UseThemePreviewPageOptions = {
  themeId: string;
  initialAgeGroupId?: string;
};

type PreviewStepLike = {
  id: string;
  tipo_paso?: { codigo?: string | null } | null;
  contenidos?: Array<{
    id?: string;
    grupo_edad_id: string;
    titulo?: string | null;
    cuerpo?: string | null;
    instruccion_corta?: string | null;
    recurso_id?: string | null;
    recurso_audio_id?: string | null;
  }> | null;
  preguntas?: Array<{
    id?: string;
    grupo_edad_id: string;
    pregunta: string;
    orden: number;
  }> | null;
};

export function obtenerContenidoPreview<T extends PreviewStepLike>(
  steps: T[],
  stepCode: string,
  ageGroupId: string,
) {
  const step = steps.find((item) => item.tipo_paso?.codigo === stepCode) ?? null;
  const content = step?.contenidos?.find(
    (item) => item.grupo_edad_id === ageGroupId,
  ) ?? null;
  return { step, content };
}

export function filtrarActividadesPreview(
  activities: ActividadAdmin[],
  ageGroupId: string,
  stepId?: string | null,
) {
  const byAge = ageGroupId
    ? activities.filter((activity) => activity.grupo_edad_id === ageGroupId)
    : activities;

  return {
    byAge,
    byStep: stepId
      ? byAge.filter((activity) => activity.paso_id === stepId)
      : [],
  };
}

export function obtenerCodigosPasosCompletosPreview(
  steps: PreviewStepLike[],
  ageGroupId: string,
) {
  return new Set(
    steps
      .filter((step) => step.contenidos?.some(
        (content) =>
          content.grupo_edad_id === ageGroupId
          && Boolean(content.titulo?.trim())
          && Boolean(content.cuerpo?.trim()),
      ))
      .map((step) => step.tipo_paso?.codigo)
      .filter((code): code is string => Boolean(code)),
  );
}


export function useThemePreviewPage({ themeId, initialAgeGroupId }: UseThemePreviewPageOptions) {
  const navigate = useNavigate();
  const [previewMode, setPreviewMode] = useState<ThemePreviewMode>("overview");
  const [selectedAgeGroupId, setSelectedAgeGroupId] = useState(initialAgeGroupId ?? "");
  const [activeStepCode, setActiveStepCode] = useState("conectar");

  const themeQuery = useQuery({
    queryKey: ["admin", "theme", themeId],
    queryFn: () => obtenerTemaAdmin(themeId),
  });

  const stepsQuery = useQuery({
    queryKey: ["admin", "theme", themeId, "steps"],
    queryFn: () => obtenerPasosAdmin(themeId),
  });

  const activitiesQuery = useQuery({
    queryKey: ["admin", "theme", themeId, "activities"],
    queryFn: () => obtenerActividadesAdmin({ tema_id: themeId, limit: 500 }),
  });

  const theme = themeQuery.data;
  const ageGroups = theme?.grupos_edad ?? [];

  const steps = useMemo(
    () => [...(stepsQuery.data ?? [])].sort((a, b) => a.orden - b.orden),
    [stepsQuery.data],
  );

  const activities = useMemo(
    () => (activitiesQuery.data?.actividades ?? []) as ActividadAdmin[],
    [activitiesQuery.data],
  );

  useEffect(() => {
    if (ageGroups.length === 0) return;
    if (selectedAgeGroupId && ageGroups.some((g) => g.id === selectedAgeGroupId)) return;
    if (initialAgeGroupId && ageGroups.some((g) => g.id === initialAgeGroupId)) {
      setSelectedAgeGroupId(initialAgeGroupId);
      return;
    }
    // Elegir primero una franja que ya tenga momentos CRECER o actividades cargadas
    const conContenido = ageGroups.find((group) => {
      const tienePaso = steps.some((step) =>
        step.contenidos?.some((c) => c.grupo_edad_id === group.id && Boolean(c.cuerpo?.trim())),
      );
      const tieneAct = activities.some((act) => act.grupo_edad_id === group.id);
      return tienePaso || tieneAct;
    });
    setSelectedAgeGroupId((conContenido ?? ageGroups[0])?.id ?? "");
  }, [ageGroups, initialAgeGroupId, selectedAgeGroupId, steps, activities]);

  const selectedAgeGroup = useMemo(
    () => ageGroups.find((group) => group.id === selectedAgeGroupId) ?? null,
    [ageGroups, selectedAgeGroupId],
  );

  const previewSelection = useMemo(
    () => obtenerContenidoPreview(steps, activeStepCode, selectedAgeGroupId),
    [activeStepCode, selectedAgeGroupId, steps],
  );
  const selectedStep = previewSelection.step;
  const selectedContent = previewSelection.content;

  const selectedQuestions = useMemo(() => {
    if (!selectedStep || !selectedAgeGroupId) return [];
    return (selectedStep.preguntas ?? [])
      .filter((question) => question.grupo_edad_id === selectedAgeGroupId)
      .sort((a, b) => a.orden - b.orden);
  }, [selectedAgeGroupId, selectedStep]);

  const filteredActivities = useMemo(
    () => filtrarActividadesPreview(
      activities,
      selectedAgeGroupId,
      selectedStep?.id,
    ),
    [activities, selectedAgeGroupId, selectedStep?.id],
  );
  const ageActivities = filteredActivities.byAge;
  const selectedStepActivities = useMemo(() => {
    if (filteredActivities.byStep.length > 0) return filteredActivities.byStep;
    const stepIdsExistentes = new Set(steps.map((s) => s.id));
    if (activeStepCode === "conectar") {
      return ageActivities.filter((a) => !a.paso_id || !stepIdsExistentes.has(a.paso_id));
    }
    return filteredActivities.byStep;
  }, [activeStepCode, ageActivities, filteredActivities.byStep, steps]);

  const completedStepCodes = useMemo(
    () => obtenerCodigosPasosCompletosPreview(steps, selectedAgeGroupId),
    [selectedAgeGroupId, steps],
  );

  const portadasFirmadas = usePortadasFirmadasAdmin(theme ? [theme] : []);
  const portadaUrl = theme
    ? resolverPortadaTemaAdmin({
        titulo: theme.titulo,
        urlFirmada: portadasFirmadas.get(theme.id) ?? null,
      })
    : null;
  const estado = obtenerEstadoTema(theme?.estado ?? "borrador");

  const navigateToEdit = () =>
    navigate({ to: "/admin/temas/$themeId/edit", params: { themeId } });
  const navigateToCrecer = () =>
    navigate({ to: "/admin/temas/$themeId/crecer", params: { themeId } });
  const navigateToActivities = () =>
    navigate({ to: "/admin/temas/$themeId/activities", params: { themeId } });
  const navigateToDetalle = () =>
    navigate({ to: "/admin/temas/$themeId/detalle", params: { themeId } });
  const navigateBack = () => navigate({ to: "/admin/temas" });

  return {
    themeQuery,
    stepsQuery,
    activitiesQuery,
    theme,
    portadaUrl,
    estado,
    ageGroups,
    selectedAgeGroup,
    selectedAgeGroupId,
    setSelectedAgeGroupId,
    previewMode,
    setPreviewMode,
    steps: steps as Paso[],
    activeStepCode,
    setActiveStepCode,
    selectedStep,
    selectedContent,
    selectedQuestions,
    ageActivities,
    selectedStepActivities,
    completedStepCodes,
    navigateToEdit,
    navigateToCrecer,
    navigateToActivities,
    navigateToDetalle,
    navigateBack,
  };
}
