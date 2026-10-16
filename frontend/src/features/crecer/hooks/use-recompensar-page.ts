import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { obtenerTema, obtenerPasos, obtenerActividades, obtenerUrlPortadaTema } from "@/features/themes/themes.api";
import { playSound } from "@/lib/audio";
import { registrarEventosCrecer } from "../services/crecer-progress";
import { completarTema as registrarTemaCompletado } from "../services/recompensar-progress";

interface UseRecompensarPageOptions {
  themeId: string;
}

export function useRecompensarPage({ themeId }: UseRecompensarPageOptions) {
  const queryClient = useQueryClient();

  const themeQuery = useQuery({
    queryKey: ["theme", themeId],
    queryFn: () => obtenerTema(themeId),
  });
  const tema = themeQuery.data;
  const temaDbId = tema?.id;

  const portadaQuery = useQuery({
    queryKey: ["theme-portada", themeId],
    queryFn: () => obtenerUrlPortadaTema(themeId),
    enabled: !!tema?.portada_recurso?.id,
    staleTime: 3 * 60 * 1000,
  });

  const stepsQuery = useQuery({
    queryKey: ["theme", temaDbId, "steps"],
    queryFn: () => obtenerPasos(temaDbId!),
    enabled: !!temaDbId,
  });

  const activitiesQuery = useQuery({
    queryKey: ["theme", temaDbId, "activities"],
    queryFn: () => obtenerActividades(temaDbId!),
    enabled: !!temaDbId,
  });

  const pasoActual = stepsQuery.data?.find((paso) => paso.tipo_paso?.codigo === "recompensar");
  const contenidoPaso = pasoActual?.contenidos?.[0];
  const actividadesFase = activitiesQuery.data?.filter(
    (actividad) => actividad.paso_id === pasoActual?.id,
  ) ?? [];

  const isLoading =
    themeQuery.isLoading ||
    (!!temaDbId && (stepsQuery.isLoading || activitiesQuery.isLoading));
  const isError = themeQuery.isError || stepsQuery.isError || activitiesQuery.isError;

  const eventMutation = useMutation({
    mutationFn: registrarEventosCrecer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["gamificacion"] });
      queryClient.invalidateQueries({ queryKey: ["sync"] });
    },
  });

  const completarTema = async () => {
    if (!temaDbId) {
      throw new Error("El tema todavía no está listo para confirmarse.");
    }

    await registrarTemaCompletado(temaDbId, pasoActual?.id, eventMutation.mutateAsync);
    playSound("insignia");
  };

  return {
    themeQuery,
    tema,
    portadaQuery,
    stepsQuery,
    activitiesQuery,
    pasoActual,
    contenidoPaso,
    actividadesFase,
    isLoading,
    isError,
    isSavingProgress: eventMutation.isPending,
    progressError: eventMutation.error,
    progresoConfirmado: eventMutation.isSuccess,
    completarTema,
  };
}
