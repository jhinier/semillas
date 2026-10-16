import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { obtenerTema, obtenerPasos, obtenerActividades } from "../../themes/themes.api";
import { obtenerMiPerfil } from "../../perfil/profile.api";
import { obtenerGruposEdad } from "../../catalog/catalog.api";
import { enviarEventosProgreso } from "../../progress/progress.api";
import type { EventoProgreso } from "../../../shared/api/api";
import { playSound } from "../../../lib/audio";

export function useComprobarPage({ themeId }: { themeId: string }) {
  const queryClient = useQueryClient();

  const themeQuery = useQuery({ queryKey: ["theme", themeId], queryFn: () => obtenerTema(themeId) });
  const temaDbId = themeQuery.data?.id;

  const stepsQuery = useQuery({
    queryKey: ["theme", temaDbId, "steps"],
    queryFn: () => obtenerPasos(temaDbId!),
    enabled: !!temaDbId
  });

  const activitiesQuery = useQuery({
    queryKey: ["theme", temaDbId, "activities"],
    queryFn: () => obtenerActividades(temaDbId!),
    enabled: !!temaDbId
  });

  const profileQuery = useQuery({ queryKey: ["me"], queryFn: obtenerMiPerfil });
  const ageGroupsQuery = useQuery({ queryKey: ["ageGroups"], queryFn: obtenerGruposEdad });

  const pasoActual = stepsQuery.data?.find((p) => p.tipo_paso?.codigo === 'comprobar');
  const contenidoPaso = pasoActual?.contenidos?.[0];

  const isLoading = themeQuery.isLoading || (!!temaDbId && (stepsQuery.isLoading || activitiesQuery.isLoading));
  const isError = themeQuery.isError || stepsQuery.isError || activitiesQuery.isError;

  const eventMutation = useMutation({
    mutationFn: enviarEventosProgreso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    }
  });

  const eventSentRef = useRef(false);
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

  const handleLegacyComplete = (actividadId: string) => {
    playSound("insignia");

    if (temaDbId) {
      const evento: EventoProgreso = {
        evento_id_cliente: crypto.randomUUID(),
        tipo_evento: "actividad_completada",
        tema_id: temaDbId,
        actividad_id: actividadId,
        ocurrido_en_cliente: new Date().toISOString(),
        datos: { origen: "juego_configuracion_cliente" }
      };
      eventMutation.mutate([evento]);
    }
  };

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

  const botonesAccion = {
    siguiente: { 
      to: "/app/E_experimentar/$themeId", 
      themeId, 
      label: "Siguiente Fase",
      onClick: () => {
        playSound("siguiente");
        guardarProgresoFase();
      }
    },
    regresar: { to: "/app/E_ensenar/$themeId", themeId },
  };

  return {
    themeQuery,
    stepsQuery,
    activitiesQuery,
    profileQuery,
    ageGroupsQuery,
    pasoActual,
    contenidoPaso,
    isLoading,
    isError,
    botonesAccion,
    handleLegacyComplete,
  };
}
