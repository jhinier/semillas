import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { obtenerTema, obtenerPasos, obtenerActividades } from "@/features/themes/themes.api";
import { obtenerMiPerfil } from "@/features/perfil/profile.api";
import type { EventoProgreso } from "@/shared/api/api";
import { registrarEventosCrecer } from "../services/crecer-progress";
import { playSound } from "@/lib/audio";

type UseCrecerFaseOptions = {
  themeId: string;
  pasoCodigo: string;
};

export function useCrecerFase({ themeId, pasoCodigo }: UseCrecerFaseOptions) {
  const queryClient = useQueryClient();
  const eventSentRef = useRef(false);
  const [actividadesCompletadas, setActividadesCompletadas] = useState<Set<string>>(
    () => new Set(),
  );

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: obtenerMiPerfil,
  });

  const themeQuery = useQuery({
    queryKey: ["theme", themeId],
    queryFn: () => obtenerTema(themeId),
  });
  const temaDbId = themeQuery.data?.id;

  const stepsQuery = useQuery({
    queryKey: ["theme", temaDbId, "steps"],
    queryFn: () => obtenerPasos(temaDbId!),
    enabled: !!temaDbId && meQuery.isSuccess,
  });

  const activitiesQuery = useQuery({
    queryKey: ["theme", temaDbId, "activities"],
    queryFn: () => obtenerActividades(temaDbId!),
    enabled: !!temaDbId && meQuery.isSuccess,
  });

  const pasoActual = stepsQuery.data?.find((paso) => paso.tipo_paso?.codigo === pasoCodigo);
  const contenidoPaso = pasoActual?.contenidos?.[0];
  const actividadesFase = useMemo(() => {
    if (!activitiesQuery.data || activitiesQuery.data.length === 0) return [];
    const conPasoId = activitiesQuery.data.filter(
      (actividad) => actividad.paso_id === pasoActual?.id,
    );
    if (conPasoId.length > 0) return conPasoId;
    const sinPasoId = activitiesQuery.data.filter(
      (actividad) => actividad.paso_id === null || actividad.paso_id === undefined,
    );
    if (sinPasoId.length > 0 && pasoCodigo === "comprobar") {
      return sinPasoId;
    }
    return [];
  }, [activitiesQuery.data, pasoActual?.id, pasoCodigo]);

  const isLoading =
    meQuery.isLoading ||
    themeQuery.isLoading ||
    (!!temaDbId && (stepsQuery.isLoading || activitiesQuery.isLoading));
  const isError =
    meQuery.isError || themeQuery.isError || stepsQuery.isError || activitiesQuery.isError;

  const invalidarProgreso = () => {
    queryClient.invalidateQueries({ queryKey: ["progress"] });
    queryClient.invalidateQueries({ queryKey: ["sync"] });
  };

  const inicioMutation = useMutation({
    mutationFn: registrarEventosCrecer,
    onSuccess: invalidarProgreso,
  });

  const progresoMutation = useMutation({
    mutationFn: registrarEventosCrecer,
    onSuccess: invalidarProgreso,
  });

  useEffect(() => {
    if (
      isLoading ||
      isError ||
      !temaDbId ||
      !pasoActual?.id ||
      eventSentRef.current
    ) {
      return;
    }

    eventSentRef.current = true;
    const ocurridoEn = new Date().toISOString();
    const eventos: EventoProgreso[] = [
      ...(pasoCodigo === "conectar"
        ? [
            {
              evento_id_cliente: crypto.randomUUID(),
              tipo_evento: "tema_iniciado" as const,
              tema_id: temaDbId,
              ocurrido_en_cliente: ocurridoEn,
            },
          ]
        : []),
      {
        evento_id_cliente: crypto.randomUUID(),
        tipo_evento: "bloque_iniciado",
        tema_id: temaDbId,
        paso_id: pasoActual.id,
        ocurrido_en_cliente: ocurridoEn,
      },
    ];

    // El inicio de fase no debe bloquear la acción de continuar.
    inicioMutation.mutate(eventos);
  }, [isLoading, isError, temaDbId, pasoActual?.id, pasoCodigo]);

  const handleActivityComplete = useCallback(
    async (actividadId: string, xp?: number, puntaje?: number) => {
      if (!temaDbId) return;

      const xpFinal = xp ?? actividadesFase.find((a) => a.id === actividadId)?.xp_recompensa ?? 0;

      if (xpFinal > 0) {
        await playSound("insignia");
      }

      await progresoMutation.mutateAsync([
        {
          evento_id_cliente: crypto.randomUUID(),
          tipo_evento: "actividad_completada",
          tema_id: temaDbId,
          paso_id: pasoActual?.id,
          actividad_id: actividadId,
          xp_otorgada: xpFinal,
          puntaje,
          ocurrido_en_cliente: new Date().toISOString(),
        },
      ]);

      setActividadesCompletadas((actuales) => {
        const siguiente = new Set(actuales);
        siguiente.add(actividadId);
        return siguiente;
      });
    },
    [pasoActual?.id, progresoMutation, temaDbId, actividadesFase],
  );

  const completeStep = useCallback(async () => {
    if (!temaDbId || !pasoActual?.id) return;

    void playSound("siguiente");

    await progresoMutation.mutateAsync([
      {
        evento_id_cliente: crypto.randomUUID(),
        tipo_evento: "bloque_completado",
        tema_id: temaDbId,
        paso_id: pasoActual.id,
        ocurrido_en_cliente: new Date().toISOString(),
      },
    ]);
  }, [pasoActual?.id, progresoMutation, temaDbId]);

  return {
    meQuery,
    themeQuery,
    stepsQuery,
    activitiesQuery,
    temaDbId,
    pasoActual,
    contenidoPaso,
    actividadesFase,
    actividadesCompletadas,
    isLoading,
    isError,
    isSavingProgress: progresoMutation.isPending,
    progressError: progresoMutation.error,
    handleActivityComplete,
    completeStep,
  };
}
