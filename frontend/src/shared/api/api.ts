import { obtenerApiUrlPublica } from "../config/env";
import { sessionStorageApi } from "./session";
import { ErrorApi } from "./error-api";
export { RUTAS_API } from "./rutas-api";

export type { Usuario, Perfil, Senda, GrupoEdad, Tema, Paso, Actividad, EventoProgreso } from "./schemas";
import type { EventoProgreso } from "./schemas";

export function obtenerMensajeErrorApi(error: unknown): string {
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object") {
    const detalle = error as { mensaje?: unknown; message?: unknown };
    if (typeof detalle.mensaje === "string" && detalle.mensaje.trim()) return detalle.mensaje;
    if (typeof detalle.message === "string" && detalle.message.trim()) return detalle.message;
  }
  return "Error de conexión";
}

export async function peticion<T>(
  ruta: string,
  opciones?: {
    metodo?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    cuerpo?: unknown;
    autenticar?: boolean;
  }
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (opciones?.autenticar !== false) {
    const idInvitado = sessionStorageApi.getGuestUserId();
    const tokenInvitado = sessionStorageApi.getGuestToken();
    const token = sessionStorageApi.getAccessToken();
    if (idInvitado) headers["X-Guest-User-Id"] = idInvitado;
    if (tokenInvitado) headers["X-Guest-Token"] = tokenInvitado;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const cuerpo = opciones?.cuerpo ? JSON.stringify(opciones.cuerpo) : undefined;
  let res: Response;
  try {
    const apiUrl = obtenerApiUrlPublica();
    res = await fetch(`${apiUrl}${ruta}`, {
      method: opciones?.metodo ?? "GET",
      headers,
      body: cuerpo,
    });
  } catch {
    throw new ErrorApi("Error de conexión", 0, "NETWORK_ERROR");
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
