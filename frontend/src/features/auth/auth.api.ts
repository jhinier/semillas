import { peticion } from "../../shared/api/api";
import type { Autenticacion, Perfil, Usuario } from "../../shared/api/api";
import {
  iniciarSesionFacebook as iniciarSesionFacebookSupabase,
  iniciarSesionConCorreo as iniciarSesionConCorreoSupabase,
  iniciarSesionGoogle as iniciarSesionGoogleSupabase,
  registrarConCorreo as registrarConCorreoSupabase,
} from "../../shared/auth/supabase";

export type SesionInvitadoRespuesta = {
  usuario: Usuario;
  perfil: Perfil;
  autenticacion: Autenticacion;
};

export function crearSesionInvitado(datos: {
  apodo: string;
  grupo_edad_id?: string;
  url_avatar?: string;
}) {
  return peticion<SesionInvitadoRespuesta>("/autenticacion/invitado", {
    metodo: "POST",
    cuerpo: datos,
    autenticar: false,
  });
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
