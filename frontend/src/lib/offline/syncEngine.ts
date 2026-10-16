import { obtenerApiUrlPublica } from "../../shared/config/env";
import { sessionStorageApi } from "../../shared/api/session";
import { db } from "./db";
import {
  getEventosPendientes,
  markEventoProcesado,
  markEventoError,
  getPendingCount,
} from "./outbox";
import type { EventoOutbox, ProgresoUsuarioLocal } from "./db";
import { claveSyncState, obtenerScopeOffline } from "./user-scope";
import { calcularEsperaReintento } from "./sync-lifecycle";
import { reconciliarConfirmacionesSync } from "./sync-reconciliation";

export type SyncStatus = "idle" | "syncing" | "error" | "offline";

export type LogroSincronizado = {
  id: string;
  codigo: string;
  nombre: string;
  bono_xp: number;
};

export interface SyncResult {
  exito: boolean;
  procesados: number;
  errores: number;
  logrosDesbloqueados: LogroSincronizado[];
  timestamp: string;
}

type EventoApi = {
  evento_id_cliente: string;
  tipo_evento: EventoOutbox["tipoEvento"];
  tema_id?: string;
  paso_id?: string;
  actividad_id?: string;
  datos: Record<string, unknown>;
  creado_en_cliente: string;
  dispositivo_id: string;
};

type RespuestaPush = {
  procesados: number;
  omitidos: number;
  procesados_ids: string[];
  omitidos_ids: string[];
  errores: Array<{ evento_id_cliente: string; error: string }>;
  logros_desbloqueados: LogroSincronizado[];
};

type ProgresoTemaApi = {
  usuario_id: string;
  tema_id: string;
  estado: string;
  porcentaje: number;
  iniciado_en: string | null;
  completado_en: string | null;
  actualizado_en: string;
};

type ProgresoActividadApi = {
  usuario_id: string;
  actividad_id: string;
  intentos: number;
  mejor_puntaje: number;
  completado: boolean;
  completado_en: string | null;
  actualizado_en: string;
};

type RespuestaPull = {
  timestamp_servidor: string;
  progreso: {
    temas: ProgresoTemaApi[];
    actividades: ProgresoActividadApi[];
  };
};

const SYNC_INTERVAL_MS = 30_000;
const PUSH_BATCH_SIZE = 50;

let syncIntervalId: ReturnType<typeof setInterval> | null = null;
let retryTimeoutId: ReturnType<typeof setTimeout> | null = null;
let retryAttempt = 0;
let isSyncing = false;

export function getSyncStatus(): SyncStatus {
  if (!navigator.onLine) return "offline";
  return isSyncing ? "syncing" : "idle";
}

export async function pushPendingEvents(): Promise<{
  procesados: number;
  errores: number;
  logrosDesbloqueados: LogroSincronizado[];
}> {
  if (isSyncing) return { procesados: 0, errores: 0, logrosDesbloqueados: [] };
  isSyncing = true;

  let procesados = 0;
  let errores = 0;
  const logrosDesbloqueados = new Map<string, LogroSincronizado>();

  try {
    const eventos = await getEventosPendientes();
    const batches = chunkArray(eventos, PUSH_BATCH_SIZE);

    for (const batch of batches) {
      const enviados: Array<{ local: EventoOutbox; api: EventoApi }> = [];

      for (const evento of batch) {
        try {
          enviados.push({ local: evento, api: await serializarEvento(evento) });
        } catch (error) {
          const mensaje = error instanceof Error ? error.message : "Evento local inválido";
          await markEventoError(evento.localId, mensaje);
          errores++;
        }
      }

      if (enviados.length === 0) continue;

      try {
        const response = await fetch(`${obtenerApiUrlPublica()}/sync/push`, {
          method: "POST",
          headers: getAuthHeaders(true),
          body: JSON.stringify({ eventos: enviados.map(({ api }) => api) }),
        });

        const cuerpo = await response.json().catch(() => null) as
          | { exito?: boolean; datos?: RespuestaPush; error?: string }
          | null;

        if (!response.ok || !cuerpo?.exito || !cuerpo.datos) {
          const mensaje = cuerpo?.error ?? `Error de sincronización (${response.status})`;
          for (const { local } of enviados) {
            await markEventoError(local.localId, mensaje);
            errores++;
          }
          continue;
        }

        for (const logro of cuerpo.datos.logros_desbloqueados ?? []) {
          logrosDesbloqueados.set(logro.id, logro);
        }

        const reconciliacion = reconciliarConfirmacionesSync(
          enviados.map(({ local }) => local.localId),
          cuerpo.datos,
        );
        for (const localId of reconciliacion.confirmados) {
          await markEventoProcesado(localId);
          procesados++;
        }
        for (const fallo of reconciliacion.fallidos) {
          await markEventoError(fallo.localId, fallo.error);
          errores++;
        }
      } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error de red";
        for (const { local } of enviados) {
          await markEventoError(local.localId, mensaje);
          errores++;
        }
      }
    }

    await actualizarEstadoSync(errores === 0);
    const logros = [...logrosDesbloqueados.values()];
    if (logros.length > 0) {
      window.dispatchEvent(new CustomEvent("semillas:logros-desbloqueados", { detail: logros }));
    }
    return { procesados, errores, logrosDesbloqueados: logros };
  } finally {
    isSyncing = false;
  }
}

export async function pullCambios(): Promise<void> {
  const scopeId = await obtenerScopeOffline();
  if (!scopeId) throw new Error("No hay una sesión offline activa");
  const syncState = await db.syncState.get(claveSyncState(scopeId));
  const params = new URLSearchParams();
  if (syncState?.lastSyncTimestamp) params.set("since", syncState.lastSyncTimestamp);

  const query = params.toString();
  const response = await fetch(`${obtenerApiUrlPublica()}/sync/pull${query ? `?${query}` : ""}`, {
    headers: getAuthHeaders(false),
  });
  const cuerpo = await response.json().catch(() => null) as
    | { exito?: boolean; datos?: RespuestaPull; error?: string }
    | null;

  if (!response.ok || !cuerpo?.exito || !cuerpo.datos) {
    throw new Error(cuerpo?.error ?? `Error al descargar cambios (${response.status})`);
  }

  const pendingCount = await getPendingCount();

  await db.transaction("rw", [db.progresoUsuario, db.syncState, db.temas, db.actividades], async () => {
    for (const progreso of cuerpo.datos!.progreso.temas) {
      await upsertProgresoTema(progreso, scopeId);
    }

    for (const progreso of cuerpo.datos!.progreso.actividades) {
      await upsertProgresoActividad(progreso, scopeId);
    }

    await db.syncState.put({
      id: claveSyncState(scopeId),
      lastSyncTimestamp: cuerpo.datos!.timestamp_servidor,
      lastSyncExito: true,
      pendingCount,
      updatedAt: new Date().toISOString(),
      scopeId,
    });
  });
}

async function upsertProgresoTema(progreso: ProgresoTemaApi, scopeId: string): Promise<void> {
  const tema = await db.temas.where("serverId").equals(progreso.tema_id).first();
  if (!tema) return;

  const serverId = `${progreso.usuario_id}:${progreso.tema_id}`;
  const existente =
    (await db.progresoUsuario.where("serverId").equals(serverId).filter((item) => item.scopeId === scopeId).first()) ??
    (await db.progresoUsuario.where("temaLocalId").equals(tema.localId).filter((item) => item.scopeId === scopeId).first());
  const ahora = new Date().toISOString();
  const datos: ProgresoUsuarioLocal = {
    localId: existente?.localId ?? crypto.randomUUID(),
    serverId,
    temaLocalId: tema.localId,
    pasoLocalId: existente?.pasoLocalId ?? null,
    actividadLocalId: null,
    estado: progreso.estado === "completado" ? "completado" : "en_progreso",
    porcentaje: progreso.porcentaje,
    iniciadoEn: progreso.iniciado_en,
    completadoEn: progreso.completado_en,
    mejorPuntaje: existente?.mejorPuntaje ?? null,
    intentos: existente?.intentos ?? 0,
    createdAt: existente?.createdAt ?? ahora,
    updatedAt: progreso.actualizado_en ?? ahora,
    syncStatus: "synced",
    scopeId,
  };

  await db.progresoUsuario.put(datos);
}

async function upsertProgresoActividad(progreso: ProgresoActividadApi, scopeId: string): Promise<void> {
  const actividad = await db.actividades.where("serverId").equals(progreso.actividad_id).first();
  if (!actividad) return;

  const serverId = `${progreso.usuario_id}:${progreso.actividad_id}`;
  const existente = await db.progresoUsuario.where("serverId").equals(serverId).filter((item) => item.scopeId === scopeId).first();
  const ahora = new Date().toISOString();

  await db.progresoUsuario.put({
    localId: existente?.localId ?? crypto.randomUUID(),
    serverId,
    temaLocalId: actividad.temaLocalId,
    pasoLocalId: actividad.pasoLocalId,
    actividadLocalId: actividad.localId,
    estado: progreso.completado ? "completado" : "en_progreso",
    porcentaje: progreso.completado ? 100 : 0,
    iniciadoEn: existente?.iniciadoEn ?? null,
    completadoEn: progreso.completado_en,
    mejorPuntaje: progreso.mejor_puntaje,
    intentos: progreso.intentos,
    createdAt: existente?.createdAt ?? ahora,
    updatedAt: progreso.actualizado_en ?? ahora,
    syncStatus: "synced",
    scopeId,
  });
}

async function serializarEvento(evento: EventoOutbox): Promise<EventoApi> {
  const [temaId, pasoId, actividadId] = await Promise.all([
    resolverServerId("tema", evento.temaLocalId),
    resolverServerId("paso", evento.pasoLocalId),
    resolverServerId("actividad", evento.actividadLocalId),
  ]);

  return {
    evento_id_cliente: evento.localId,
    tipo_evento: evento.tipoEvento,
    ...(temaId ? { tema_id: temaId } : {}),
    ...(pasoId ? { paso_id: pasoId } : {}),
    ...(actividadId ? { actividad_id: actividadId } : {}),
    datos: evento.datos ?? {},
    creado_en_cliente: evento.ocurridoEnCliente,
    dispositivo_id: evento.dispositivoId,
  };
}

async function resolverServerId(
  tipo: "tema" | "paso" | "actividad",
  localId?: string
): Promise<string | undefined> {
  if (!localId) return undefined;

  const registro = tipo === "tema"
    ? await db.temas.get(localId)
    : tipo === "paso"
      ? await db.pasos.get(localId)
      : await db.actividades.get(localId);

  if (!registro?.serverId) {
    throw new Error(`No se puede sincronizar: ${tipo} local sin ID del servidor`);
  }

  return registro.serverId;
}

export async function syncFull(): Promise<SyncResult> {
  if (!navigator.onLine) {
    return { exito: false, procesados: 0, errores: 0, logrosDesbloqueados: [], timestamp: new Date().toISOString() };
  }

  try {
    const pushResult = await pushPendingEvents();
    await pullCambios();
    retryAttempt = 0;
    return {
      exito: pushResult.errores === 0,
      procesados: pushResult.procesados,
      errores: pushResult.errores,
      logrosDesbloqueados: pushResult.logrosDesbloqueados,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    await actualizarEstadoSync(false);
    programarReintento();
    notificarFalloSincronizacion("No pudimos sincronizar tu progreso en segundo plano.");
    return {
      exito: false,
      procesados: 0,
      errores: 1,
      logrosDesbloqueados: [],
      timestamp: new Date().toISOString(),
    };
  }
}

export function startAutoSync(): void {
  if (syncIntervalId) return;

  syncIntervalId = setInterval(async () => {
    if (navigator.onLine && (await getPendingCount()) > 0) {
      await pushPendingEvents();
    }
  }, SYNC_INTERVAL_MS);

  window.addEventListener("online", onOnline);
  document.addEventListener("visibilitychange", onVisibilityChange);
  if (navigator.onLine) {
    window.setTimeout(() => void syncFull(), 1_000);
  }
}

export function stopAutoSync(): void {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
  window.removeEventListener("online", onOnline);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  if (retryTimeoutId) {
    clearTimeout(retryTimeoutId);
    retryTimeoutId = null;
  }
  retryAttempt = 0;
}

async function onOnline(): Promise<void> {
  await syncFull();
  window.dispatchEvent(new CustomEvent("semillas:sync-state"));
}

async function onVisibilityChange(): Promise<void> {
  if (document.visibilityState !== "visible" || !navigator.onLine || isSyncing) return;
  if ((await getPendingCount()) > 0) await syncFull();
}

function programarReintento(): void {
  if (!syncIntervalId || retryTimeoutId || !navigator.onLine) return;
  const espera = calcularEsperaReintento(retryAttempt++);
  retryTimeoutId = setTimeout(async () => {
    retryTimeoutId = null;
    const resultado = await syncFull();
    if (!resultado.exito) programarReintento();
  }, espera);
}

async function actualizarEstadoSync(exito: boolean): Promise<void> {
  const ahora = new Date().toISOString();
  const scopeId = await obtenerScopeOffline();
  if (!scopeId) return;
  const syncStateId = claveSyncState(scopeId);
  const existente = await db.syncState.get(syncStateId);
  await db.syncState.put({
    id: syncStateId,
    lastSyncTimestamp: existente?.lastSyncTimestamp ?? null,
    lastSyncExito: exito,
    pendingCount: await getPendingCount(),
    updatedAt: ahora,
    scopeId,
  });
}

export function notificarFalloSincronizacion(mensaje: string): void {
  window.dispatchEvent(new CustomEvent("semillas:sync-error", { detail: { mensaje } }));
}

function getAuthHeaders(conJson: boolean): Record<string, string> {
  const headers: Record<string, string> = {};
  if (conJson) headers["Content-Type"] = "application/json";

  const guestId = sessionStorageApi.getGuestUserId();
  const guestToken = sessionStorageApi.getGuestToken();
  const token = sessionStorageApi.getAccessToken();
  if (guestId) headers["X-Guest-User-Id"] = guestId;
  if (guestToken) headers["X-Guest-Token"] = guestToken;
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
