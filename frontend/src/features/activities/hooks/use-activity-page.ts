import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { queryClient } from "../../../app/query-client";
import { randomUUID } from "../../../shared/utils/uuid";
import { responderActividad, obtenerActividad } from "../activities.api";

export function useActivityPage(activityId: string) {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);

  const activityQuery = useQuery({
    queryKey: ["activity", activityId],
    queryFn: () => obtenerActividad(activityId),
  });

  const completionMutation = useMutation({
    mutationFn: () =>
      responderActividad(activityId, {
        evento_id_cliente: randomUUID(),
        completada: true,
        ocurrido_en_cliente: new Date().toISOString(),
        dispositivo_id: "web",
      }),
    onSuccess() {
      setCompleted(true);
      invalidateProgress();
    },
    onError(error) {
      setCompleted(false);
      toast.error(error instanceof Error ? error.message : "No se pudo registrar el progreso");
    },
  });

  const activity = activityQuery.data;
  const completionResult = completionMutation.data;

  const handleComplete = async () => {
    const usesServerOptions =
      activity?.tipo_actividad?.codigo === "cuestionario" &&
      Boolean(activity.opciones.length);

    if (usesServerOptions) {
      setCompleted(true);
      invalidateProgress();
      return;
    }

    if (!completionMutation.isPending && !completionResult) {
      await completionMutation.mutateAsync();
    }
  };

  const handleGoBack = () => {
    if (activity?.tema_id) {
      navigate({ to: "/app/temas/$themeId", params: { themeId: activity.tema_id } });
      return;
    }
    navigate({ to: "/app" });
  };

  return {
    activity,
    completed,
    completionResult,
    resultadoOffline: Boolean(completionResult && "offline" in completionResult && completionResult.offline),
    handleComplete,
    handleGoBack,
    activityQuery,
    completionMutation,
  };
}

function invalidateProgress() {
  queryClient.invalidateQueries({ queryKey: ["gamification", "me"] });
  queryClient.invalidateQueries({ queryKey: ["progress"] });
}
