import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { obtenerTema, obtenerPasos, obtenerActividades, obtenerUrlPortadaTema } from "@/features/themes/themes.api";
import { obtenerMiPerfil } from "@/features/perfil/profile.api";
import { playSound } from "@/lib/audio";
import { registrarEventosCrecer } from "../services/crecer-progress";
import { completarTema as registrarTemaCompletado } from "../services/recompensar-progress";
import {
  obtenerSeedSendaEdad,
  resolverClaveSendaTema,
  resolverCodigoGrupoEdad,
} from "./use-crecer-fase";

interface UseRecompensarPageOptions {
  themeId: string;
}

export function useRecompensarPage({ themeId }: UseRecompensarPageOptions) {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: obtenerMiPerfil,
  });
  const grupoEdadId = meQuery.data?.perfil?.grupo_edad_id ?? undefined;
  const codigoGrupoEdad = useMemo(
    () => resolverCodigoGrupoEdad(grupoEdadId, meQuery.data?.grupos_edad),
    [grupoEdadId, meQuery.data?.grupos_edad],
  );

  const themeQuery = useQuery({
    queryKey: ["theme", themeId],
    queryFn: () => obtenerTema(themeId),
  });
  const tema = themeQuery.data;
  const temaDbId = tema?.id;
  const claveSenda = useMemo(() => resolverClaveSendaTema(tema), [tema]);
  const seedSendaEdad = useMemo(
    () => obtenerSeedSendaEdad(claveSenda, codigoGrupoEdad),
    [claveSenda, codigoGrupoEdad],
  );

  const portadaQuery = useQuery({
    queryKey: ["theme-portada", themeId],
    queryFn: () => obtenerUrlPortadaTema(themeId),
    enabled: !!tema?.portada_recurso?.id,
    staleTime: 3 * 60 * 1000,
  });

  const stepsQuery = useQuery({
    queryKey: ["theme", temaDbId, "steps", grupoEdadId ?? "all"],
    queryFn: () => obtenerPasos(temaDbId!, grupoEdadId),
    enabled: !!temaDbId,
  });

  const activitiesQuery = useQuery({
    queryKey: ["theme", temaDbId, "activities", grupoEdadId ?? "all"],
    queryFn: () => obtenerActividades(temaDbId!, grupoEdadId),
    enabled: !!temaDbId,
  });

  const pasoActual = stepsQuery.data?.find((paso) => paso.tipo_paso?.codigo === "recompensar");
  const contenidoPaso = useMemo(() => {
    const exacto = grupoEdadId
      ? pasoActual?.contenidos?.find((c) => c.grupo_edad_id === grupoEdadId)
      : undefined;
    if (exacto) return exacto;
    const seed = seedSendaEdad.pasos.recompensar;
    return {
      id: `recompensar-${claveSenda}-${codigoGrupoEdad}`,
      paso_id: pasoActual?.id ?? "",
      grupo_edad_id: grupoEdadId ?? "",
      titulo: seed.titulo,
      instruccion_corta: seed.instruccion_corta,
      cuerpo: seed.cuerpo,
      recurso_id: null,
      recurso_audio_id: null,
      datos_extra: {},
    };
  }, [pasoActual, grupoEdadId, seedSendaEdad, claveSenda, codigoGrupoEdad]);

  const actividadesFase =
    activitiesQuery.data?.filter(
      (actividad) =>
        actividad.paso_id === pasoActual?.id &&
        (!grupoEdadId || !actividad.grupo_edad_id || actividad.grupo_edad_id === grupoEdadId),
    ) ?? [];

  const isLoading =
    meQuery.isLoading ||
    themeQuery.isLoading ||
    (!!temaDbId && (stepsQuery.isLoading || activitiesQuery.isLoading));
  const isError = themeQuery.isError && !tema && !contenidoPaso;

  const eventMutation = useMutation({
    mutationFn: registrarEventosCrecer,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["progress"] });
      void queryClient.invalidateQueries({ queryKey: ["gamification", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["gamificacion"] });
      void queryClient.invalidateQueries({ queryKey: ["temas"] });
      void queryClient.invalidateQueries({ queryKey: ["theme"] });
      void queryClient.invalidateQueries({ queryKey: ["sync"] });
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const completarTema = async () => {
    const idFinal = temaDbId ?? themeId;
    try {
      await registrarTemaCompletado(idFinal, pasoActual?.id, eventMutation.mutateAsync);
    } catch {
      // permitir cerrar la lección aunque esté sin conexión
    }
    void playSound("insignia");
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
