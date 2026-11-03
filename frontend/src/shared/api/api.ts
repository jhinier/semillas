import { obtenerApiUrlPublica } from "../config/env";
import { sessionStorageApi } from "./session";
import { ErrorApi } from "./error-api";
import { renovarSesionAutenticada } from "../auth/supabase";
export { RUTAS_API } from "./rutas-api";

export type { Usuario, Perfil, Senda, GrupoEdad, Tema, Paso, Actividad, EventoProgreso, ContenidoPaso } from "./schemas";

export function obtenerMensajeErrorApi(error: unknown): string {
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object") {
    const detalle = error as { mensaje?: unknown; message?: unknown };
    if (typeof detalle.mensaje === "string" && detalle.mensaje.trim()) return detalle.mensaje;
    if (typeof detalle.message === "string" && detalle.message.trim()) return detalle.message;
  }
  return "Error de conexión";
}

let promesaRenovacionInvitado: Promise<boolean> | null = null;

/**
 * Si la sesión actual es un invitado creado en modo sin conexión (`offline-guest-...` / `offline-token-...`)
 * y ahora hay red disponible, registra automáticamente una sesión de invitado válida en el backend
 * para que todas las peticiones autenticadas funcionen de forma transparente.
 * Nunca crea una sesión si el usuario cerró sesión o no tiene sesión activa.
 */
export async function asegurarSesionInvitadoRemota(forzar = false): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return false;
  if (sessionStorageApi.isExplicitlyLoggedOut()) return false;
  if (sessionStorageApi.getAccessToken()) return true;

  const idActual = sessionStorageApi.getGuestUserId();
  const tokenActual = sessionStorageApi.getGuestToken();

  // Si no hay sesión de invitado activa, NO crear una automáticamente (evita re-iniciar sesión tras cerrar sesión)
  if (!idActual || !tokenActual) return false;

  const esSesionOffline =
    idActual.startsWith("offline-") || tokenActual.startsWith("offline-");

  if (!forzar && !esSesionOffline) return true;
  if (promesaRenovacionInvitado) return promesaRenovacionInvitado;

  promesaRenovacionInvitado = (async () => {
    try {
      if (sessionStorageApi.isExplicitlyLoggedOut()) return false;
      const apiUrl = obtenerApiUrlPublica();
      let apodo = "Semillero";
      let grupoEdadId: string | undefined;
      try {
        const raw = localStorage.getItem("semillas_perfil_cache_v1");
        if (raw) {
          const parsed = JSON.parse(raw) as { perfil?: { apodo?: string; grupo_edad_id?: string | null } };
          if (parsed?.perfil?.apodo) apodo = parsed.perfil.apodo;
          if (
            parsed?.perfil?.grupo_edad_id &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
              parsed.perfil.grupo_edad_id,
            )
          ) {
            grupoEdadId = parsed.perfil.grupo_edad_id;
          }
        }
      } catch {
        // continuar con valores por defecto
      }

      const res = await fetch(`${apiUrl}/autenticacion/invitado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apodo,
          ...(grupoEdadId ? { grupo_edad_id: grupoEdadId } : {}),
        }),
      });
      const json = (await res.json().catch(() => null)) as {
        exito?: boolean;
        datos?: { autenticacion?: { valor?: string; token?: string } };
      } | null;

      if (sessionStorageApi.isExplicitlyLoggedOut()) return false;

      const nuevoId = json?.datos?.autenticacion?.valor;
      const nuevoToken = json?.datos?.autenticacion?.token;
      if (res.ok && json?.exito && nuevoId && nuevoToken) {
        sessionStorageApi.setGuestUserId(nuevoId);
        sessionStorageApi.setGuestToken(nuevoToken);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      promesaRenovacionInvitado = null;
    }
  })();

  return promesaRenovacionInvitado;
}

function construirHeadersAutenticacion(autenticar: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (autenticar && !sessionStorageApi.isExplicitlyLoggedOut()) {
    const token = sessionStorageApi.getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      const idInvitado = sessionStorageApi.getGuestUserId();
      const tokenInvitado = sessionStorageApi.getGuestToken();
      if (idInvitado) headers["X-Guest-User-Id"] = idInvitado;
      if (tokenInvitado) headers["X-Guest-Token"] = tokenInvitado;
    }
  }

  return headers;
}

export async function peticion<T>(
  ruta: string,
  opciones?: {
    metodo?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    cuerpo?: unknown;
    autenticar?: boolean;
  },
): Promise<T> {
  const autenticar = opciones?.autenticar !== false && ruta !== "/autenticacion/invitado";

  if (
    autenticar &&
    !sessionStorageApi.isExplicitlyLoggedOut() &&
    !sessionStorageApi.getAccessToken() &&
    sessionStorageApi.getGuestUserId() &&
    sessionStorageApi.getGuestToken()
  ) {
    await asegurarSesionInvitadoRemota(false);
  }

  const headers = construirHeadersAutenticacion(autenticar);
  const cuerpo = opciones?.cuerpo ? JSON.stringify(opciones.cuerpo) : undefined;
  const apiUrl = obtenerApiUrlPublica();

  let res: Response;
  try {
    res = await fetch(`${apiUrl}${ruta}`, {
      method: opciones?.metodo ?? "GET",
      headers,
      body: cuerpo,
    });
  } catch {
    throw new ErrorApi("Error de conexión", 0, "NETWORK_ERROR");
  }

  // Si la sesión de invitado expiró o no existe en el servidor (401), renovarla automáticamente y reintentar una vez
  if (
    res.status === 401 &&
    autenticar &&
    !sessionStorageApi.isExplicitlyLoggedOut() &&
    !sessionStorageApi.getAccessToken() &&
    sessionStorageApi.getGuestUserId()
  ) {
    const renovada = await asegurarSesionInvitadoRemota(true);
    if (renovada) {
      try {
        res = await fetch(`${apiUrl}${ruta}`, {
          method: opciones?.metodo ?? "GET",
          headers: construirHeadersAutenticacion(true),
          body: cuerpo,
        });
      } catch {
        throw new ErrorApi("Error de conexión", 0, "NETWORK_ERROR");
      }
    }
  }

  // Si la sesión de usuario autenticado expiró (401), renovar el token con Supabase y reintentar
  if (
    res.status === 401 &&
    autenticar &&
    !sessionStorageApi.isExplicitlyLoggedOut() &&
    sessionStorageApi.getAccessToken()
  ) {
    const tokenRenovado = await renovarSesionAutenticada();
    if (tokenRenovado) {
      try {
        res = await fetch(`${apiUrl}${ruta}`, {
          method: opciones?.metodo ?? "GET",
          headers: construirHeadersAutenticacion(true),
          body: cuerpo,
        });
      } catch {
        throw new ErrorApi("Error de conexión", 0, "NETWORK_ERROR");
      }
    }
  }

  const resultado = await res.json().catch(() => null);

  if (!res.ok || !resultado?.exito) {
    const mensaje = obtenerMensajeErrorApi(resultado?.error);
    const codigo = resultado?.codigo;
    throw new ErrorApi(mensaje, res.status, codigo);
  }

  return resultado.datos as T;
}

// --- Tipos de la API (todos en español, como el backend) ---

export interface Autenticacion {
  tipo: "invitado";
  encabezado: "x-guest-user-id";
  valor: string;
  encabezado_token: "x-guest-token";
  token: string;
}
