import { peticion } from "../../shared/api/api";

export type UsuarioAdminDetalle = {
  id: string;
  rol: string;
  proveedor: string;
  nombre_visible: string | null;
  correo: string | null;
  activo: boolean | null;
  creado_en: string;
  actualizado_en: string;
  ultimo_login_en: string | null;
  perfil: {
    apodo?: string | null;
    urlAvatar?: string | null;
    url_avatar?: string | null;
    claveAvatar?: string | null;
    clave_avatar?: string | null;
    grupoEdadId?: string | null;
    grupo_edad_id?: string | null;
    nivelActual?: number | null;
    nivel_actual?: number | null;
    xpAcumulada?: number | null;
    xp_acumulada?: number | null;
    prefiereAudio?: boolean | null;
    prefiere_audio?: boolean | null;
    tamanoTextoPreferido?: string | null;
    tamano_texto_preferido?: string | null;
  } | null;
};

export function obtenerUsuarioAdminDetalle(usuarioId: string) {
  return peticion<UsuarioAdminDetalle>(`/administracion/usuarios/${usuarioId}`);
}

export function actualizarUsuarioAdminDetalle(
  usuarioId: string,
  datos: { nombre_visible?: string; rol?: "administrador" | "usuario" | "invitado" | "padre" },
) {
  return peticion<UsuarioAdminDetalle>(`/administracion/usuarios/${usuarioId}`, {
    metodo: "PATCH",
    cuerpo: datos,
  });
}

export function desactivarUsuarioAdmin(usuarioId: string) {
  return peticion<{ eliminado: true }>(`/administracion/usuarios/${usuarioId}`, {
    metodo: "DELETE",
  });
}
