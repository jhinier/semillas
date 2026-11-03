import { peticion } from "../../shared/api/api";
import type { Autenticacion, Perfil, Usuario } from "../../shared/api/api";
import {
  iniciarSesionFacebook as iniciarSesionFacebookSupabase,
  iniciarSesionConCorreo as iniciarSesionConCorreoSupabase,
  iniciarSesionGoogle as iniciarSesionGoogleSupabase,
  registrarConCorreo as registrarConCorreoSupabase,
} from "../../shared/auth/supabase";
import { sessionStorageApi } from "../../shared/api/session";
import { db, type PerfilLocal } from "@/lib/offline/db";

export type SesionInvitadoRespuesta = {
  usuario: Usuario;
  perfil: Perfil;
  autenticacion: Autenticacion;
};

const CACHE_PERFIL_KEY = "semillas_perfil_cache_v1";
const LAST_SCOPE_KEY = "semillas_last_scope_id";

async function crearSesionInvitadoLocal(datos: {
  apodo: string;
  grupo_edad_id?: string;
  url_avatar?: string;
}): Promise<SesionInvitadoRespuesta> {
  const ahora = new Date().toISOString();
  const idExistente = sessionStorageApi.getGuestUserId();
  const tokenExistente = sessionStorageApi.getGuestToken();
  const guestId = idExistente || crypto.randomUUID();
  const guestToken = tokenExistente || `offline-guest-${crypto.randomUUID()}`;
  const scopeId = `invitado:${guestId}`;
  const grupoEdadGuardado =
    datos.grupo_edad_id ||
    (typeof localStorage !== "undefined" ? localStorage.getItem("onboarding_grupo_edad_id") : null) ||
    "semillas";

  const usuario: Usuario = {
    id: guestId,
    rol: "invitado",
    proveedor: "invitado",
    nombre_visible: datos.apodo || "Semillero",
    correo: null,
  };

  const perfil: Perfil = {
    id: guestId,
    usuario_id: guestId,
    apodo: datos.apodo || "Semillero",
    grupo_edad_id: grupoEdadGuardado,
    url_avatar: datos.url_avatar ?? null,
    clave_avatar: "1",
    prefiere_audio: true,
    tamano_texto_preferido: "mediano",
    creado_en: ahora,
    actualizado_en: ahora,
  };

  sessionStorageApi.setGuestUserId(guestId);
  sessionStorageApi.setGuestToken(guestToken);

  try {
    localStorage.setItem(LAST_SCOPE_KEY, scopeId);
    localStorage.setItem(
      CACHE_PERFIL_KEY,
      JSON.stringify({ usuario, perfil, savedAt: ahora }),
    );
  } catch {
    // ignorar si localStorage no está disponible
  }

  try {
    const registro: PerfilLocal = {
      localId: guestId,
      serverId: guestId,
      usuarioId: guestId,
      usuarioRol: "invitado",
      usuarioProveedor: "invitado",
      usuarioNombreVisible: usuario.nombre_visible,
      usuarioCorreo: null,
      apodo: perfil.apodo,
      grupoEdadId: perfil.grupo_edad_id,
      urlAvatar: perfil.url_avatar,
      claveAvatar: perfil.clave_avatar ?? "1",
      prefiereAudio: true,
      tamanoTextoPreferido: "mediano",
      createdAt: ahora,
      updatedAt: ahora,
      syncStatus: "pending",
      scopeId,
    };
    await db.perfil.put(registro);
  } catch {
    // ignorar si IndexedDB falla
  }

  return {
    usuario,
    perfil,
    autenticacion: {
      tipo: "invitado",
      encabezado: "x-guest-user-id",
      valor: guestId,
      encabezado_token: "x-guest-token",
      token: guestToken,
    },
  };
}

export async function crearSesionInvitado(datos: {
  apodo: string;
  grupo_edad_id?: string;
  url_avatar?: string;
}): Promise<SesionInvitadoRespuesta> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return crearSesionInvitadoLocal(datos);
  }

  try {
    const respuesta = await peticion<SesionInvitadoRespuesta>("/autenticacion/invitado", {
      metodo: "POST",
      cuerpo: datos,
      autenticar: false,
    });

    const scopeId = `invitado:${respuesta.autenticacion.valor}`;
    try {
      localStorage.setItem(LAST_SCOPE_KEY, scopeId);
      localStorage.setItem(
        CACHE_PERFIL_KEY,
        JSON.stringify({
          usuario: respuesta.usuario,
          perfil: respuesta.perfil,
          savedAt: new Date().toISOString(),
        }),
      );
    } catch {
      // ignorar
    }

    return respuesta;
  } catch {
    // Si no hay conexión o el servidor no responde, permitir entrar como invitado local sin bloquear al usuario
    return crearSesionInvitadoLocal(datos);
  }
}

export function iniciarSesionGoogle(redirectTo: string) {
  return iniciarSesionGoogleSupabase(redirectTo);
}

export function iniciarSesionFacebook(redirectTo: string) {
  return iniciarSesionFacebookSupabase(redirectTo);
}

export function registrarConCorreo(email: string, password: string) {
  return registrarConCorreoSupabase(email, password);
}

export function iniciarSesionConCorreo(email: string, password: string) {
  return iniciarSesionConCorreoSupabase(email, password);
}
