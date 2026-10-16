import { useRouter } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearActividad, eliminarActividad, actualizarActividad } from "../admin.api";
import { useActivityFormState } from "../componentes/temas/use-activity-form-state";
import type { Opcion } from "../componentes/temas/use-activity-form-state";

function mapearOpciones(options: Opcion[]) {
  return options
    .filter(o => o.texto)
    .map((option, index) => ({
      etiqueta: option.etiqueta,
      texto: option.texto,
      correcta: option.correcta,
      orden: index + 1,
      retroalimentacion: undefined,
    }));
}

interface UseThemeActivitiesPageProps {
  themeId: string;
  actividadId?: string;
  form?: "nueva" | "editar";
}

export function useThemeActivitiesPage({
  themeId,
  actividadId,
  form,
}: UseThemeActivitiesPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const isEditMode = form === "editar" && !!actividadId;
  const isNewMode = form === "nueva";

  const {
    selectedAgeGroupId,
    setSelectedAgeGroupId,
    title,
    setTitle,
    prompt,
    setPrompt,
    xpReward,
    setXpReward,
    selectedStepId,
    setSelectedStepId,
    selectedActivityTypeId,
    setSelectedActivityTypeId,
    feedback,
    setFeedback,
    options,
    setOptions,
    resetForm,
    ageGroupsQuery,
    activitiesQuery,
    stepsQuery,
    activityTypesQuery,
  } = useActivityFormState({
    actividadId,
    themeId,
    isEditMode,
  });

  const createMutation = useMutation({
    mutationFn: () => {
      if (!selectedStepId || !selectedActivityTypeId) throw new Error("Faltan campos");
      return crearActividad({
        tema_id: themeId,
        paso_id: selectedStepId || null,
        grupo_edad_id: selectedAgeGroupId,
        tipo_actividad_id: selectedActivityTypeId,
        titulo: title,
        consigna: prompt,
        retroalimentacion: feedback || undefined,
        orden: (activitiesQuery.data?.length ?? 0) + 1,
        xp_recompensa: xpReward,
        dificultad: "facil",
        obligatorio: true,
        configuracion: {},
        opciones: mapearOpciones(options)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId, "activities"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "activities"] });
      router.navigate({ to: "/admin/temas/$themeId/activities", params: { themeId }, search: {} });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!actividadId) throw new Error("ID de actividad requerido");
      return actualizarActividad(actividadId, {
        titulo: title,
        consigna: prompt,
        retroalimentacion: feedback || undefined,
        xp_recompensa: xpReward,
        paso_id: selectedStepId || null,
        tipo_actividad_id: selectedActivityTypeId,
        grupo_edad_id: selectedAgeGroupId,
        dificultad: "facil",
        obligatorio: true,
        opciones: mapearOpciones(options)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "activities"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId, "activities"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "activity", actividadId] });
      router.navigate({ to: "/admin/temas/$themeId/activities", params: { themeId }, search: {} });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: eliminarActividad,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "activities"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId, "activities"] });
    }
  });

  const isFormOpen = isNewMode || isEditMode;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleOptionChange = (idx: number, texto: string) => {
    setOptions(options.map((o, j) => j === idx ? { ...o, texto } : o));
  };

  const handleCorrectChange = (idx: number) => {
    setOptions(options.map((o, j) => ({ ...o, correcta: j === idx })));
  };

  const handleSubmit = () => {
    if (isEditMode) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleClose = () => {
    router.navigate({ to: "/admin/temas/$themeId/activities", params: { themeId }, search: {} });
    resetForm();
  };

  return {
    themeId,
    selectedAgeGroupId,
    setSelectedAgeGroupId,
    title,
    setTitle,
    prompt,
    setPrompt,
    xpReward,
    setXpReward,
    selectedStepId,
    setSelectedStepId,
    selectedActivityTypeId,
    setSelectedActivityTypeId,
    feedback,
    setFeedback,
    options,
    setOptions,
    ageGroupsQuery,
    activitiesQuery,
    stepsQuery,
    activityTypesQuery,
    isEditMode,
    isNewMode,
    isFormOpen,
    isSubmitting,
    deleteMutation,
    handleOptionChange,
    handleCorrectChange,
    handleSubmit,
    handleClose,
  };
}
