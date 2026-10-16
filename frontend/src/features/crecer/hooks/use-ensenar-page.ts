import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { obtenerTema, obtenerPasos, obtenerActividades } from "../../themes/themes.api";
import { enviarEventosProgreso } from "../../progress/progress.api";
import type { EventoProgreso, Paso, Actividad, Tema } from "../../../shared/api/api";

interface ContenidoPaso {
  id: string;
  titulo: string;
  cuerpo: string;
}

interface UseEnsenarPageResult {
  themeQuery: ReturnType<typeof useQuery<Tema>>;
  stepsQuery: ReturnType<typeof useQuery<Paso[]>>;
  activitiesQuery: ReturnType<typeof useQuery<Actividad[]>>;
  pasoActual: Paso | undefined;
  contenidoPaso: ContenidoPaso | undefined;
  actividadesFase: Actividad[];
  isLoading: boolean;
  isError: boolean;
  eventMutation: ReturnType<typeof useMutation<any, any, EventoProgreso[]>>;
  guardarProgresoFase: () => void;
}

export function useEnsenarPage(themeId: string): UseEnsenarPageResult {
  const themeQuery = useQuery({
    queryKey: ["theme", themeId],
    queryFn: () => obtenerTema(themeId),
  });
  const temaDbId = themeQuery.data?.id;

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

  const pasoActual = stepsQuery.data?.find((p) => p.tipo_paso?.codigo === "ensenar");
  const contenidoPaso = pasoActual?.contenidos?.[0];
  const actividadesFase = activitiesQuery.data?.filter((a) => a.paso_id === pasoActual?.id) || [];

  const isLoading =
    themeQuery.isLoading || (!!temaDbId && (stepsQuery.isLoading || activitiesQuery.isLoading));
  const isError = themeQuery.isError || stepsQuery.isError || activitiesQuery.isError;

  const eventSentRef = useRef(false);
  const queryClient = useQueryClient();
  const eventMutation = useMutation({
    mutationFn: enviarEventosProgreso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });

  useEffect(() => {
    if (!isLoading && !isError && temaDbId && pasoActual?.id && !eventSentRef.current) {
      eventSentRef.current = true;
      const evento: EventoProgreso = {
        evento_id_cliente: crypto.randomUUID(),
        tipo_evento: "bloque_iniciado",
        tema_id: temaDbId,
        paso_id: pasoActual.id,
        ocurrido_en_cliente: new Date().toISOString(),
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

  return {
    themeQuery,
    stepsQuery,
    activitiesQuery,
    pasoActual,
    contenidoPaso,
    actividadesFase,
    isLoading,
    isError,
    eventMutation,
    guardarProgresoFase,
  };
}
