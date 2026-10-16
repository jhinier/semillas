import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { obtenerTema, obtenerPasos, obtenerActividades, obtenerUrlPortadaTema } from "../themes.api";
import { obtenerMiPerfil } from "../../perfil/profile.api";
import { obtenerMiProgreso } from "../../progress/progress.api";
import { playSound } from "../../../lib/audio";
import {
  eliminarTemaDescargado,
  useDescargarTema,
  useOnlineStatus,
  useTemasLocales,
} from "@/lib/offline";
import { obtenerRutaFase } from "@/features/crecer/crecer-fases";

export function useTemaDetalle(themeId: string) {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const meQuery = useQuery({ queryKey: ["me"], queryFn: obtenerMiPerfil, staleTime: 1000 * 60 * 5 });
  const themeQuery = useQuery({ queryKey: ["theme", themeId], queryFn: () => obtenerTema(themeId) });
  const portadaQuery = useQuery({
    queryKey: ["theme-portada", themeId],
    queryFn: () => obtenerUrlPortadaTema(themeId),
    enabled: Boolean(themeId),
    staleTime: 10 * 60 * 1000,
  });
  const stepsQuery = useQuery({
    queryKey: ["theme", themeId, "steps", meQuery.data?.perfil?.grupo_edad_id],
    queryFn: () => obtenerPasos(themeId, meQuery.data?.perfil?.grupo_edad_id ?? undefined),
    enabled: Boolean(themeId),
  });
  const activitiesQuery = useQuery({
    queryKey: ["theme", themeId, "activities", meQuery.data?.perfil?.grupo_edad_id],
    queryFn: () => obtenerActividades(themeId, meQuery.data?.perfil?.grupo_edad_id ?? undefined),
    enabled: Boolean(themeId),
  });
  const progressQuery = useQuery({ queryKey: ["progress", themeId], queryFn: obtenerMiProgreso, staleTime: 1000 * 60 * 3 });
  const localesQuery = useTemasLocales();
  const downloadMutation = useDescargarTema();

  const firstActivity = activitiesQuery.data?.[0];
  const theme = themeQuery.data;
  const temaDbId = theme?.id;
  const temaLocal = useMemo(
    () => (localesQuery.data ?? []).find((item) => item.serverId === themeId),
    [localesQuery.data, themeId],
  );
  const actualizacionDisponible = Boolean(theme && temaLocal && theme.version_contenido > temaLocal.versionContenido);

  const progresoActual = progressQuery.data?.progresos_tema?.find((p) => p.tema_id === temaDbId);
  const progresoReal = progresoActual ? progresoActual.porcentaje : 0;
  const ultimoPaso = stepsQuery.data?.find((paso) => paso.id === progresoActual?.ultimo_paso_id);
  const rutaContinuacion =
    progresoActual?.estado === "completado"
      ? obtenerRutaFase("recompensar")
      : obtenerRutaFase(ultimoPaso?.tipo_paso?.codigo);
  const temaDescargado = Boolean(temaLocal);
  const pasosDisponibles = stepsQuery.data?.length ?? 6;
  const pasosEstimadosCompletados =
    progresoActual?.estado === "completado"
      ? pasosDisponibles
      : Math.min(pasosDisponibles, Math.floor((progresoReal / 100) * pasosDisponibles));

  const handleIniciarClick = () => playSound("iniciar");

  const handleDescargar = async () => {
    const grupoEdadId = meQuery.data?.perfil?.grupo_edad_id;
    if (!grupoEdadId) {
      toast.error("Selecciona tu franja de edad antes de descargar el tema.");
      return;
    }
    if (!isOnline) {
      toast.error("Necesitas conexión para descargar o actualizar el tema.");
      return;
    }
    try {
      setDownloadProgress(1);
      await downloadMutation.mutateAsync({
        temaId: themeId,
        perfilGrupoEdadId: grupoEdadId ?? undefined,
        onProgress: (progress) => setDownloadProgress(progress),
      });
      toast.success("Tema listo para usar sin conexión.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo descargar el tema.");
    } finally {
      setDownloadProgress(null);
    }
  };

  const handleEliminarDescarga = async () => {
    if (!window.confirm("¿Eliminar este tema del dispositivo?")) return;
    try {
      await eliminarTemaDescargado(themeId);
      await queryClient.invalidateQueries({ queryKey: ["offline"] });
      toast.success("Tema eliminado del dispositivo.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la descarga.");
    }
  };

  return {
    meQuery,
    themeQuery,
    portadaQuery,
    stepsQuery,
    activitiesQuery,
    progressQuery,
    firstActivity,
    theme,
    temaDbId,
    progresoActual,
    progresoReal,
    ultimoPaso,
    rutaContinuacion,
    temaDescargado,
    pasosDisponibles,
    pasosEstimadosCompletados,
    handleIniciarClick,
    isOnline,
    actualizacionDisponible,
    downloadProgress,
    isDownloading: downloadMutation.isPending,
    handleDescargar,
    handleEliminarDescarga,
  };
}
