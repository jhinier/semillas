import { generarCredencialInvitado } from "../../../shared/security/guest-token";
import type { AuthRepository } from "../auth.repository";

export function crearCasoCrearInvitado(repositorio: AuthRepository) {
  return async function crearInvitado(body: { apodo: string; grupo_edad_id?: string; url_avatar?: string }) {
    const credencial = await generarCredencialInvitado();
    const usuario = await repositorio.crearUsuarioApp({
      proveedor: "invitado",
      rol: "invitado",
      nombre_visible: body.apodo,
      correo: null,
      token_invitado_hash: credencial.hash
    });

    try {
      const perfil = await repositorio.crearPerfil({
        usuario_id: usuario.id,
        apodo: body.apodo,
        grupo_edad_id: body.grupo_edad_id ?? null,
        url_avatar: body.url_avatar ?? null
      });

      return { usuario, perfil, tokenInvitado: credencial.token };
    } catch (error) {
      await repositorio.eliminarUsuarioApp(usuario.id);
      throw error;
    }
  };
}
