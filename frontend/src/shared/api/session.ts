const GUEST_USER_ID_KEY = "semillas_guest_user_id";
const ACCESS_TOKEN_KEY = "semillas_access_token";
const GUEST_TOKEN_KEY = "semillas_guest_token";
const AUTH_USER_ID_KEY = "semillas_auth_user_id";
const CONFLICTO_MENSAJE_KEY = "semillas_conflicto_vinculacion";

function obtenerAlmacenLocal() {
  if (typeof localStorage === "undefined") return null;

  return localStorage;
}

export const sessionStorageApi = {
  getGuestUserId() {
    return obtenerAlmacenLocal()?.getItem(GUEST_USER_ID_KEY) ?? null;
  },

  setGuestUserId(id: string) {
    obtenerAlmacenLocal()?.setItem(GUEST_USER_ID_KEY, id);
  },

  clearGuestUserId() {
    obtenerAlmacenLocal()?.removeItem(GUEST_USER_ID_KEY);
  },

  getGuestToken() {
    return obtenerAlmacenLocal()?.getItem(GUEST_TOKEN_KEY) ?? null;
  },

  setGuestToken(token: string) {
    obtenerAlmacenLocal()?.setItem(GUEST_TOKEN_KEY, token);
  },

  clearGuestToken() {
    obtenerAlmacenLocal()?.removeItem(GUEST_TOKEN_KEY);
  },

  clearGuestSession() {
    const almacenamiento = obtenerAlmacenLocal();
    almacenamiento?.removeItem(GUEST_USER_ID_KEY);
    almacenamiento?.removeItem(GUEST_TOKEN_KEY);
  },

  getAccessToken() {
    return obtenerAlmacenLocal()?.getItem(ACCESS_TOKEN_KEY) ?? null;
  },

  getAuthUserId() {
    return obtenerAlmacenLocal()?.getItem(AUTH_USER_ID_KEY) ?? null;
  },

  setAuthUserId(id: string) {
    obtenerAlmacenLocal()?.setItem(AUTH_USER_ID_KEY, id);
  },

  clearAuthUserId() {
    obtenerAlmacenLocal()?.removeItem(AUTH_USER_ID_KEY);
  },

  setAccessToken(token: string) {
    obtenerAlmacenLocal()?.setItem(ACCESS_TOKEN_KEY, token);
  },

  clearAccessToken() {
    obtenerAlmacenLocal()?.removeItem(ACCESS_TOKEN_KEY);
  },

  getConflictoMensaje() {
    return obtenerAlmacenLocal()?.getItem(CONFLICTO_MENSAJE_KEY) ?? null;
  },

  setConflictoMensaje(mensaje: string) {
    obtenerAlmacenLocal()?.setItem(CONFLICTO_MENSAJE_KEY, mensaje);
  },

  clearConflictoMensaje() {
    obtenerAlmacenLocal()?.removeItem(CONFLICTO_MENSAJE_KEY);
  },
};
