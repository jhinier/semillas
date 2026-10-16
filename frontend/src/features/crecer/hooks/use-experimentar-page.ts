import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { obtenerTema, obtenerPasos, obtenerActividades } from "../../themes/themes.api";
import { enviarEventosProgreso } from "../../progress/progress.api";
import type { EventoProgreso, Paso, Actividad } from "../../../shared/api/api";

const FASE_CONFIG = {
  numero: 5,
  nombre: "Experimentar" as const,
  colorAccent: '#f43f5e',
  colorLoader: '#f43f5e',
};

interface UseExperimentarPageProps {
  themeId: string;
}

interface BotonesAccion {
  siguiente: { to: string; themeId: string; label: string; onClick?: () => void };
  regresar: { to: string; themeId: string };
}

interface ExperimentarPageData {
  themeQuery: ReturnType<typeof useQuery>;
  stepsQuery: ReturnType<typeof useQuery>;
  activitiesQuery: ReturnType<typeof useQuery>;
  temaDbId: string | undefined;
  pasoActual: Paso | undefined;
  contenidoPaso: Paso["contenidos"][0] | undefined;
  preguntasReflexion: NonNullable<Paso["preguntas"]>;
  actividadesFase: Actividad[];
  isLoading: boolean;
  isError: boolean;
  botonesAccion: BotonesAccion;
  hasContent: boolean;
  faseConfig: typeof FASE_CONFIG;
}

export function useExperimentarPage({ themeId }: UseExperimentarPageProps): ExperimentarPageData {
  const themeQuery = useQuery({ queryKey: ["theme", themeId], queryFn: () => obtenerTema(themeId) });
  const temaDbId = themeQuery.data?.id;

  const stepsQuery = useQuery<Paso[]>({
    queryKey: ["theme", temaDbId, "steps"],
    queryFn: () => obtenerPasos(temaDbId!),
    enabled: !!temaDbId
  });

  const activitiesQuery = useQuery<Actividad[]>({
    queryKey: ["theme", temaDbId, "activities"],
    queryFn: () => obtenerActividades(temaDbId!),
    enabled: !!temaDbId
  });

  const pasoActual = stepsQuery.data?.find((p) => p.tipo_paso?.codigo === 'experimentar');
  const contenidoPaso = pasoActual?.contenidos?.[0];
  const preguntasReflexion = pasoActual?.preguntas ?? [];
  const actividadesFase = (activitiesQuery.data ?? []).filter((a) => a.paso_id === pasoActual?.id);

  const isLoading = themeQuery.isLoading || (!!temaDbId && (stepsQuery.isLoading || activitiesQuery.isLoading));
  const isError = themeQuery.isError || stepsQuery.isError || activitiesQuery.isError;

  const eventSentRef = useRef(false);
  const queryClient = useQueryClient();
  const eventMutation = useMutation({
    mutationFn: enviarEventosProgreso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    }
  });

  useEffect(() => {
    if (!isLoading && !isError && temaDbId && pasoActual?.id && !eventSentRef.current) {
      eventSentRef.current = true;
      const evento: EventoProgreso = {
        evento_id_cliente: crypto.randomUUID(),
        tipo_evento: "bloque_iniciado",
        tema_id: temaDbId,
        paso_id: pasoActual.id,
        ocurrido_en_cliente: new Date().toISOString()
      };
      eventMutation.mutate([evento]);
    }
  }, [isLoading, isError, temaDbId, pasoActual, eventMutation]);

  const guardarProgresoFase = () => {
    if (temaDbId && pasoActual?.id) {
      const evento: EventoProgreso = {
        evento_id_cliente: crypto.randomUUID(),
        tipo_evento: "bloque_completado",
        tema_id: temaDbId,
        paso_id: pasoActual.id,
        ocurrido_en_cliente: new Date().toISOString()
      };
      eventMutation.mutate([evento]);
    }
  };

  const botonesAccion: BotonesAccion = {
    siguiente: { 
      to: "/app/R_recompensar/$themeId", 
      themeId, 
      label: "Siguiente Fase",
      onClick: guardarProgresoFase
    },
    regresar: { to: "/app/C_comprobar/$themeId", themeId },
  };

  const hasContent = Boolean(contenidoPaso || preguntasReflexion.length > 0 || actividadesFase.length > 0);

  return {
    themeQuery,
    stepsQuery,
    activitiesQuery,
    temaDbId,
    pasoActual,
    contenidoPaso,
    preguntasReflexion,
    actividadesFase,
    isLoading,
    isError,
    botonesAccion,
    hasContent,
    faseConfig: FASE_CONFIG,
  };
}
