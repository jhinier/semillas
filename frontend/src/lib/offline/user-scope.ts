import { sessionStorageApi } from "@/shared/api/session";

const LAST_SCOPE_KEY = "semillas_last_scope_id";

export async function obtenerScopeOffline(): Promise<string | null> {
  const authUserId = sessionStorageApi.getAuthUserId();
  if (authUserId) return `usuario:${authUserId}`;
  const guestId = sessionStorageApi.getGuestUserId();
  if (guestId) return `invitado:${guestId}`;

  try {
    const ultimoScope =
      typeof localStorage !== "undefined" ? localStorage.getItem(LAST_SCOPE_KEY) : null;
    if (ultimoScope) return ultimoScope;
  } catch {
    // ignorar
  }

  return null;
}

export function perteneceAlScope(scopeId: string | undefined, activo: string | null): boolean {
  return Boolean(activo && scopeId === activo);
}

export function claveSyncState(scopeId: string): string {
  return `sync:${scopeId}`;
}
