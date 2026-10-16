import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { obtenerTemas } from "@/features/themes/themes.api";
import { usePortadasFirmadas } from "@/features/themes/hooks/usePortadasFirmadas";
import { obtenerMiPerfil } from "@/features/perfil/profile.api";
import {
  eliminarTemaDescargado,
  useDescargaJobs,
  useDescargarTema,
  useEliminarEventosFallidos,
  useOfflineStorage,
  useOnlineStatus,
  useReintentarEventosFallidos,
  useSincronizarAhora,
  useSyncStatus,
  useTemasLocales,
} from "@/lib/offline";
import { db, type TemaLocal } from "@/lib/offline/db";
import type { Tema } from "@/shared/api/api";

export type FiltroDescarga = "todos" | "descargados" | "disponibles" | "actualizaciones";
export type OrdenDescarga = "recientes" | "nombre" | "tamano";

export type TemaDescargaUI = {
  id: string;
  titulo: string;
  descripcion: string;
  imagenUrl: string | null;
  senda: string;
  color: string;
  minutos: number;
  xp: number;
  version: number;
  descargado: boolean;
  actualizacionDisponible: boolean;
  tamanoBytes: number | null;
  pasos: number | null;
  actividades: number | null;
  medios: number | null;
  descargadoEn: string | null;
  progresoDescarga: number | null;
  errorDescarga: string | null;
};

export function useDescargasPage() {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const [showBanner, setShowBanner] = useState(true);
  const [activeTab, setActiveTab] = useState<FiltroDescarga>("todos");
  const [sortOrder, setSortOrder] = useState<OrdenDescarga>("recientes");
  const [searchQuery, setSearchQuery] = useState("");
  const [progressById, setProgressById] = useState<Record<string, number>>({});

  const temasQuery = useQuery({ queryKey: ["temas"], queryFn: () => obtenerTemas(), staleTime: 1000 * 60 * 5 });
  const perfilQuery = useQuery({ queryKey: ["me"], queryFn: obtenerMiPerfil, staleTime: 1000 * 60 * 5 });
  const localesQuery = useTemasLocales();
  const jobsQuery = useDescargaJobs();
  const storageQuery = useOfflineStorage();
  const syncQuery = useSyncStatus();
  const countsQuery = useQuery({
    queryKey: ["offline", "content-counts"],
    queryFn: async () => {
      const [pasos, actividades] = await Promise.all([db.pasos.toArray(), db.actividades.toArray()]);
      const counts = new Map<string, { pasos: number; actividades: number }>();
      for (const paso of pasos) {
        const actual = counts.get(paso.temaLocalId) ?? { pasos: 0, actividades: 0 };
        counts.set(paso.temaLocalId, { ...actual, pasos: actual.pasos + 1 });
      }
      for (const actividad of actividades) {
        const actual = counts.get(actividad.temaLocalId) ?? { pasos: 0, actividades: 0 };
        counts.set(actividad.temaLocalId, { ...actual, actividades: actual.actividades + 1 });
      }
      return counts;
    },
    refetchInterval: 10_000,
  });
  const downloadMutation = useDescargarTema();
  const syncMutation = useSincronizarAhora();
  const retryFailedMutation = useReintentarEventosFallidos();
  const discardFailedMutation = useEliminarEventosFallidos();
  const portadas = usePortadasFirmadas(temasQuery.data ?? []);

  const temas = useMemo<TemaDescargaUI[]>(() => {
    const locales = localesQuery.data ?? [];
    const localPorServer = new Map(locales.flatMap((tema) => tema.serverId ? [[tema.serverId, tema] as const] : []));
    const jobs = new Map((jobsQuery.data ?? []).map((job) => [job.temaServerId, job]));
    const remotos = temasQuery.data ?? [];
    const serverIds = new Set(remotos.map((tema) => tema.id));

    return [
      ...remotos.map((tema) => mapearTemaRemoto(tema, localPorServer.get(tema.id), countsQuery.data?.get(localPorServer.get(tema.id)?.localId ?? ""), progressById[tema.id] ?? jobs.get(tema.id)?.progreso ?? null, jobs.get(tema.id)?.estado === "error" ? jobs.get(tema.id)?.error ?? null : null, portadas.get(tema.id) ?? null)),
      ...locales.filter((tema) => tema.serverId && !serverIds.has(tema.serverId)).map((tema) => mapearTemaLocal(tema, countsQuery.data?.get(tema.localId), progressById[tema.serverId!] ?? jobs.get(tema.serverId!)?.progreso ?? null, jobs.get(tema.serverId!)?.estado === "error" ? jobs.get(tema.serverId!)?.error ?? null : null)),
    ];
  }, [countsQuery.data, jobsQuery.data, localesQuery.data, portadas, progressById, temasQuery.data]);

  const filteredTemas = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("es");
    return temas.filter((tema) => {
      const coincideBusqueda = !query || `${tema.titulo} ${tema.descripcion} ${tema.senda}`.toLocaleLowerCase("es").includes(query);
      const coincideFiltro = activeTab === "todos" || (activeTab === "descargados" && tema.descargado) || (activeTab === "disponibles" && !tema.descargado) || (activeTab === "actualizaciones" && tema.actualizacionDisponible);
      return coincideBusqueda && coincideFiltro;
    }).sort((a, b) => sortOrder === "nombre" ? a.titulo.localeCompare(b.titulo, "es") : sortOrder === "tamano" ? (b.tamanoBytes ?? 0) - (a.tamanoBytes ?? 0) : new Date(b.descargadoEn ?? 0).getTime() - new Date(a.descargadoEn ?? 0).getTime());
  }, [activeTab, searchQuery, sortOrder, temas]);

  const stats = useMemo(() => {
    const descargados = temas.filter((tema) => tema.descargado);
    return { total: temas.length, descargados: descargados.length, disponibles: temas.length - descargados.length, actualizaciones: temas.filter((tema) => tema.actualizacionDisponible).length, packageBytes: descargados.reduce((total, tema) => total + (tema.tamanoBytes ?? 0), 0) };
  }, [temas]);

  const refresh = () => Promise.all([queryClient.invalidateQueries({ queryKey: ["offline"] }), queryClient.invalidateQueries({ queryKey: ["temas"] }), queryClient.invalidateQueries({ queryKey: ["theme"] })]);
  const handleDownload = async (temaId: string) => {
    const grupoEdadId = perfilQuery.data?.perfil.grupo_edad_id;
    if (!grupoEdadId) return toast.error("Completa tu franja de edad antes de descargar contenido.");
    if (!isOnline) return toast.error("Conéctate a internet para descargar o actualizar un tema.");
    try {
      setProgressById((actual) => ({ ...actual, [temaId]: 1 }));
      const resultado = await downloadMutation.mutateAsync({ temaId, perfilGrupoEdadId: perfilQuery.data?.perfil.grupo_edad_id ?? undefined, onProgress: (progreso) => setProgressById((actual) => ({ ...actual, [temaId]: progreso })) });
      await refresh();
      toast.success(`Tema listo sin conexión: ${resultado.pasosCount} pasos y ${resultado.actividadesCount} actividades.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo descargar el tema.");
    } finally {
      setProgressById((actual) => Object.fromEntries(Object.entries(actual).filter(([id]) => id !== temaId)));
    }
  };
  const handleDelete = async (temaId: string) => {
    if (!window.confirm("¿Eliminar este tema del dispositivo? El progreso ya sincronizado seguirá en tu cuenta.")) return;
    try { await eliminarTemaDescargado(temaId); await refresh(); toast.success("Descarga eliminada del dispositivo."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo eliminar la descarga."); }
  };
  const handleDeleteAll = async () => {
    const descargados = temas.filter((tema) => tema.descargado);
    if (!descargados.length || !window.confirm(`¿Eliminar los ${descargados.length} temas descargados de este dispositivo?`)) return;
    try { for (const tema of descargados) await eliminarTemaDescargado(tema.id); await refresh(); toast.success("Se eliminó todo el contenido descargado."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Hay progreso pendiente. Sincroniza antes de eliminar todo."); }
  };
  const handleSync = async () => { if (!isOnline) return toast.error("No hay conexión para sincronizar."); const resultado = await syncMutation.mutateAsync(); await refresh(); resultado.exito ? toast.success("Progreso sincronizado.") : toast.error("No se pudo completar la sincronización."); };
  const handleRetryFailed = async () => { if (!isOnline) return toast.error("Conéctate para reintentar la sincronización."); await retryFailedMutation.mutateAsync(); await refresh(); };
  const handleDiscardFailed = async () => { if (!window.confirm("¿Descartar los eventos que no pudieron sincronizarse? Esta acción puede perder progreso local no enviado.")) return; await discardFailedMutation.mutateAsync(); };

  return { showBanner, setShowBanner, activeTab, setActiveTab, sortOrder, setSortOrder, searchQuery, setSearchQuery, filteredTemas, stats, isOnline, isLoading: temasQuery.isLoading || localesQuery.isLoading, isError: temasQuery.isError && !(localesQuery.data?.length), storage: storageQuery.data, syncStatus: syncQuery.data, isSyncing: syncMutation.isPending || retryFailedMutation.isPending, handleDownload, handleDelete, handleDeleteAll, handleSync, handleRetryFailed, handleDiscardFailed };
}

function mapearTemaRemoto(tema: Tema, local: TemaLocal | undefined, counts: { pasos: number; actividades: number } | undefined, progreso: number | null, error: string | null, portada: string | null): TemaDescargaUI {
  return { id: tema.id, titulo: tema.titulo, descripcion: tema.resumen ?? tema.objetivo, imagenUrl: local?.portadaMediaId ? `/__offline_media/${encodeURIComponent(local.portadaMediaId)}` : portada, senda: tema.senda?.nombre ?? "Senda", color: tema.senda?.color_hex ?? "#7e57c2", minutos: tema.minutos_estimados, xp: tema.xp_recompensa, version: tema.version_contenido, descargado: Boolean(local), actualizacionDisponible: Boolean(local && tema.version_contenido > local.versionContenido), tamanoBytes: local?.packageSizeBytes ?? local?.paqueteTamanoBytes ?? null, pasos: counts?.pasos ?? null, actividades: counts?.actividades ?? null, medios: local?.mediaServerIds?.length ?? null, descargadoEn: local?.downloadedAt ?? local?.descargadoEn ?? null, progresoDescarga: progreso, errorDescarga: error };
}

function mapearTemaLocal(local: TemaLocal, counts: { pasos: number; actividades: number } | undefined, progreso: number | null, error: string | null): TemaDescargaUI {
  return { id: local.serverId ?? local.localId, titulo: local.titulo, descripcion: local.resumen ?? local.objetivo, imagenUrl: local.portadaMediaId ? `/__offline_media/${encodeURIComponent(local.portadaMediaId)}` : local.portadaUrl, senda: local.sendaNombre ?? "Senda", color: local.sendaColorHex ?? "#7e57c2", minutos: local.minutosEstimados, xp: local.xpRecompensa, version: local.versionContenido, descargado: true, actualizacionDisponible: false, tamanoBytes: local.packageSizeBytes ?? local.paqueteTamanoBytes ?? null, pasos: counts?.pasos ?? null, actividades: counts?.actividades ?? null, medios: local.mediaServerIds?.length ?? null, descargadoEn: local.downloadedAt ?? local.descargadoEn ?? null, progresoDescarga: progreso, errorDescarga: error };
}
