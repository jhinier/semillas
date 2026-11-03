import { sessionStorageApi } from "./session";

export function hasSession() {
  if (sessionStorageApi.isExplicitlyLoggedOut()) {
    return false;
  }

  const guestCompleto = Boolean(
    sessionStorageApi.getGuestUserId() && sessionStorageApi.getGuestToken(),
  );

  if (guestCompleto || Boolean(sessionStorageApi.getAccessToken())) {
    return true;
  }

  // Solo si el usuario recarga la página estando SIN CONEXIÓN y tenía un perfil activo previo (sin haber cerrado sesión)
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && !navigator.onLine) {
    try {
      const tieneCachePerfil = Boolean(
        window.localStorage.getItem("semillas_perfil_cache_v1") ||
          window.localStorage.getItem("semillas_last_scope_id"),
      );
      if (tieneCachePerfil) {
        const guestId =
          sessionStorageApi.getGuestUserId() ||
          sessionStorageApi.getAuthUserId() ||
          "offline-guest-semillas";
        sessionStorageApi.setGuestUserId(guestId);
        sessionStorageApi.setGuestToken(`offline-token-${guestId}`);
        return true;
      }
    } catch {
      // ignorar
    }
  }

  return false;
}
