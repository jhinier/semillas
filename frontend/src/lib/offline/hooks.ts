import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "./db";
import { eliminarEventosFallidos, getPendingCount, getEventosFallidos, queueEventoProgreso, reintentarEventosFallidos } from "./outbox";
import { getSyncStatus, startAutoSync, stopAutoSync, syncFull } from "./syncEngine";
import { obtenerUsoAlmacenamiento } from "./media-cache";
import { claveSyncState, obtenerScopeOffline } from "./user-scope";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const actualizar = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", actualizar);
    window.addEventListener("offline", actualizar);
    return () => {
      window.removeEventListener("online", actualizar);
      window.removeEventListener("offline", actualizar);
    };
  }, []);

  return isOnline;
}

export function useSyncStatus() {
  const isOnline = useOnlineStatus();
  return useQuery({
    queryKey: ["sync", "status", isOnline],
    queryFn: async () => {
      const pendingCount = await getPendingCount();
      const failedCount = (await getEventosFallidos()).length;
      const scopeId = await obtenerScopeOffline();
      const syncState = scopeId ? await db.syncState.get(claveSyncState(scopeId)) : undefined;
      const lifecycleStatus = getSyncStatus();
      return {
        pendingCount,
        failedCount,
        lastSyncTimestamp: syncState?.lastSyncTimestamp ?? null,
        lastSyncExito: syncState?.lastSyncExito ?? false,
        isSyncing: lifecycleStatus === "syncing",
        isOnline,
      };
    },
    refetchInterval: 10_000,
  });
}

export function useEventosPendientes() {
  return useQuery({
    queryKey: ["sync", "pending-events"],
    queryFn: () => getPendingCount(),
    refetchInterval: 10_000,
  });
}

export function useTemasLocales() {
  return useQuery({
    queryKey: ["offline", "temas"],
    queryFn: () => db.temas.orderBy("downloadedAt").reverse().toArray(),
    refetchInterval: 10_000,
  });
}

export function useDescargaJobs() {
  return useQuery({
    queryKey: ["offline", "jobs"],
    queryFn: () => db.descargaJobs.toArray(),
    refetchInterval: 10_000,
  });
}

export function useOfflineStorage() {
  return useQuery({
    queryKey: ["offline", "storage"],
    queryFn: obtenerUsoAlmacenamiento,
    refetchInterval: 15_000,
  });
}

export function useTemaLocal(localId: string) {
  return useQuery({
    queryKey: ["offline", "tema", localId],
    queryFn: () => db.temas.get(localId),
    enabled: !!localId,
  });
}

export function usePasosLocales(temaLocalId: string) {
  return useQuery({
    queryKey: ["offline", "pasos", temaLocalId],
    queryFn: () => db.pasos.where("temaLocalId").equals(temaLocalId).sortBy("orden"),
    enabled: !!temaLocalId,
  });
}

export function useActividadesLocales(temaLocalId: string, grupoEdadId: string) {
  return useQuery({
    queryKey: ["offline", "actividades", temaLocalId, grupoEdadId],
    queryFn: () =>
      db.actividades
        .where("temaLocalId")
        .equals(temaLocalId)
        .filter((actividad) => actividad.grupoEdadId === grupoEdadId)
        .toArray(),
    enabled: !!temaLocalId && !!grupoEdadId,
  });
}

export function useProgresoLocal(temaLocalId: string) {
  return useQuery({
    queryKey: ["offline", "progreso", temaLocalId],
    queryFn: async () => {
      const scopeId = await obtenerScopeOffline();
      if (!scopeId) return undefined;
      return db.progresoUsuario
        .where("temaLocalId")
        .equals(temaLocalId)
        .filter((item) => item.actividadLocalId === null && item.scopeId === scopeId)
        .first();
    },
    enabled: !!temaLocalId,
  });
}

export function useProgresosLocales() {
  return useQuery({
    queryKey: ["offline", "progresos"],
    queryFn: async () => {
      const scopeId = await obtenerScopeOffline();
      if (!scopeId) return [];
      return db.progresoUsuario.filter((item) => item.scopeId === scopeId).toArray();
    },
  });
}

export function useRegistrarEventoProgreso() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      tipoEvento: Parameters<typeof queueEventoProgreso>[0];
      temaLocalId?: string;
      pasoLocalId?: string;
      actividadLocalId?: string;
      correcta?: boolean;
      puntaje?: number;
      xpOtorgada?: number;
      datos?: Record<string, unknown>;
    }) =>
      queueEventoProgreso(params.tipoEvento, {
        temaLocalId: params.temaLocalId,
        pasoLocalId: params.pasoLocalId,
        actividadLocalId: params.actividadLocalId,
        correcta: params.correcta,
        puntaje: params.puntaje,
        xpOtorgada: params.xpOtorgada,
        datos: params.datos,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sync"] });
    },
  });
}

export function useSincronizarAhora() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncFull,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sync"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
}

export function useAutoSync(enabled = true) {
  useEffect(() => {
    if (!enabled) {
      stopAutoSync();
      return;
    }
    startAutoSync();
    return () => stopAutoSync();
  }, [enabled]);
}


export function useReintentarEventosFallidos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const count = await reintentarEventosFallidos();
      if (count > 0 && navigator.onLine) await syncFull();
      return count;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sync"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });
}

export function useEliminarEventosFallidos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarEventosFallidos,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["sync"] }),
  });
}
