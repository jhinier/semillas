import { sessionStorageApi } from "@/shared/api/session";

export async function obtenerScopeOffline(): Promise<string | null> {
  const authUserId = sessionStorageApi.getAuthUserId();
  if (authUserId) return `usuario:${authUserId}`;
  const guestId = sessionStorageApi.getGuestUserId();
  if (guestId) return `invitado:${guestId}`;
  // Sin una sesión explícita no se debe inferir el propietario desde IndexedDB.
  return null;
}

export function perteneceAlScope(scopeId: string | undefined, activo: string | null): boolean {
  return Boolean(activo && scopeId === activo);
}

export function claveSyncState(scopeId: string): string {
  return `sync:${scopeId}`;
}
