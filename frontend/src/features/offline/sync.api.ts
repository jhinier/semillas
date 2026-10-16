import { peticion, RUTAS_API } from "../../shared/api/api";
import type { EventoProgreso } from "../../shared/api/api";

export type PullSyncResponse = {
  temas_actualizados: Array<unknown>;
  perfil_actualizado?: unknown;
  timestamp_servidor: string;
};

/**
 * Envía el outbox de eventos pendientes de sincronización acumulados localmente sin internet (idempotente).
 * 
 * HTTP Verb: POST
 * Endpoint: /sync/push
 * Auth: Requerido
 */
export function sincronizarPush(eventosPendientes: EventoProgreso[]) {
  return peticion<{ exito: boolean; procesados: number }>(RUTAS_API.SYNC.PUSH, {
    metodo: "POST",
    cuerpo: { eventos: eventosPendientes },
  });
}

/**
 * Trae las últimas actualizaciones de contenido y progreso del servidor para actualizar la IndexedDB local.
 * 
 * HTTP Verb: GET
 * Endpoint: /sync/pull?since=...
 * Auth: Requerido
 */
export function sincronizarPull(desdeFecha?: string) {
  const params = new URLSearchParams();
  if (desdeFecha) params.set("since", desdeFecha);
  const query = params.toString();

  return peticion<PullSyncResponse>(
    `${RUTAS_API.SYNC.PULL}${query ? `?${query}` : ""}`
  );
}
