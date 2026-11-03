const GUEST_USER_ID_KEY = "semillas_guest_user_id";
const ACCESS_TOKEN_KEY = "semillas_access_token";
const GUEST_TOKEN_KEY = "semillas_guest_token";
const AUTH_USER_ID_KEY = "semillas_auth_user_id";
const CONFLICTO_MENSAJE_KEY = "semillas_conflicto_vinculacion";
const LOGGED_OUT_FLAG_KEY = "semillas_logged_out_explicit";
const CACHE_KEY_PERFIL = "semillas_perfil_cache_v1";
const LAST_SCOPE_KEY = "semillas_last_scope_id";

function obtenerAlmacenLocal() {
  if (typeof localStorage === "undefined") return null;

  return localStorage;
}

function recuperarSesionSupabaseDesdeStorage(local: Storage): { accessToken: string; userId: string | null } | null {
  try {
    for (let i = 0; i < local.length; i++) {
      const key = local.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const raw = local.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          const token = parsed?.access_token;
          if (typeof token === "string" && token) {
            return {
              accessToken: token,
              userId: typeof parsed?.user?.id === "string" ? parsed.user.id : null,
            };
          }
        }
      }
    }
  } catch {
    // ignorar errores de lectura o JSON
  }
  return null;
}

export const sessionStorageApi = {
  isExplicitlyLoggedOut() {
    const local = obtenerAlmacenLocal();
    if (!local) return false;
    return local.getItem(LOGGED_OUT_FLAG_KEY) === "1";
  },

  clearLoggedOutFlag() {
    obtenerAlmacenLocal()?.removeItem(LOGGED_OUT_FLAG_KEY);
  },

  getGuestUserId() {
    return obtenerAlmacenLocal()?.getItem(GUEST_USER_ID_KEY) ?? null;
  },

  setGuestUserId(id: string) {
    const almacenamiento = obtenerAlmacenLocal();
    almacenamiento?.removeItem(LOGGED_OUT_FLAG_KEY);
    almacenamiento?.setItem(GUEST_USER_ID_KEY, id);
  },

  clearGuestUserId() {
    obtenerAlmacenLocal()?.removeItem(GUEST_USER_ID_KEY);
  },

  getGuestToken() {
    return obtenerAlmacenLocal()?.getItem(GUEST_TOKEN_KEY) ?? null;
  },

  setGuestToken(token: string) {
    const almacenamiento = obtenerAlmacenLocal();
    almacenamiento?.removeItem(LOGGED_OUT_FLAG_KEY);
    almacenamiento?.setItem(GUEST_TOKEN_KEY, token);
  },

  clearGuestToken() {
    obtenerAlmacenLocal()?.removeItem(GUEST_TOKEN_KEY);
  },

  clearGuestSession() {
    const almacenamiento = obtenerAlmacenLocal();
    almacenamiento?.removeItem(GUEST_USER_ID_KEY);
    almacenamiento?.removeItem(GUEST_TOKEN_KEY);
  },

  clearAllSession() {
    const almacenamiento = obtenerAlmacenLocal();
    if (!almacenamiento) return;
    almacenamiento.setItem(LOGGED_OUT_FLAG_KEY, "1");
    almacenamiento.removeItem(GUEST_USER_ID_KEY);
    almacenamiento.removeItem(GUEST_TOKEN_KEY);
    almacenamiento.removeItem(ACCESS_TOKEN_KEY);
    almacenamiento.removeItem(AUTH_USER_ID_KEY);
    almacenamiento.removeItem(CONFLICTO_MENSAJE_KEY);
    almacenamiento.removeItem(CACHE_KEY_PERFIL);
    almacenamiento.removeItem(LAST_SCOPE_KEY);
    almacenamiento.removeItem("onboarding_grupo_edad_id");
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < almacenamiento.length; i++) {
        const key = almacenamiento.key(i);
        if (key && (key.startsWith("sb-") || key.includes("supabase.auth"))) {
          keysToRemove.push(key);
        }
      }
      for (const key of keysToRemove) {
        almacenamiento.removeItem(key);
      }
    } catch {
      // Ignorar errores de acceso
    }
  },

  getAccessToken() {
    const local = obtenerAlmacenLocal();
    if (!local) return null;
    if (local.getItem(LOGGED_OUT_FLAG_KEY) === "1") return null;

    const supabaseSession = recuperarSesionSupabaseDesdeStorage(local);
    if (supabaseSession?.accessToken) {
      local.setItem(ACCESS_TOKEN_KEY, supabaseSession.accessToken);
      if (supabaseSession.userId) {
        local.setItem(AUTH_USER_ID_KEY, supabaseSession.userId);
      }
      return supabaseSession.accessToken;
    }

    const token = local.getItem(ACCESS_TOKEN_KEY);
    if (token) return token;

    return null;
  },

  getAuthUserId() {
    const local = obtenerAlmacenLocal();
    if (!local) return null;
    if (local.getItem(LOGGED_OUT_FLAG_KEY) === "1") return null;

    const supabaseSession = recuperarSesionSupabaseDesdeStorage(local);
    if (supabaseSession?.userId) {
      local.setItem(AUTH_USER_ID_KEY, supabaseSession.userId);
      return supabaseSession.userId;
    }

    const userId = local.getItem(AUTH_USER_ID_KEY);
    if (userId) return userId;

    return null;
  },

  setAuthUserId(id: string) {
    const almacenamiento = obtenerAlmacenLocal();
    almacenamiento?.removeItem(LOGGED_OUT_FLAG_KEY);
    almacenamiento?.setItem(AUTH_USER_ID_KEY, id);
  },

  clearAuthUserId() {
    obtenerAlmacenLocal()?.removeItem(AUTH_USER_ID_KEY);
  },

  setAccessToken(token: string) {
    const almacenamiento = obtenerAlmacenLocal();
    almacenamiento?.removeItem(LOGGED_OUT_FLAG_KEY);
    almacenamiento?.setItem(ACCESS_TOKEN_KEY, token);
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