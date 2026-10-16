import type { AuthSessionUser } from "../../../config/env";
import { ErrorNoAutorizado, ErrorConflicto } from "../../../shared/errores/error-aplicacion";
import type { UsuarioRepository } from "../usuario.repository";

type Dependencias = {
  usuarios: UsuarioRepository;
};

type UsuarioAutenticado = {
  id: string;
  provider: string;
  displayName: string;
  email: string | null;
};

export function crearCasoVincularCuenta({ usuarios }: Dependencias) {
  return async function vincularCuenta(
    usuario: UsuarioAutenticado,
    authSessionUser: AuthSessionUser | undefined
  ) {
    if (usuario.provider !== "invitado") {
      throw new ErrorConflicto("Solo las cuentas invitadas pueden reclamar una cuenta vinculada");
    }

    if (!authSessionUser) {
      throw new ErrorNoAutorizado("Falta la sesión autenticada para vincular la cuenta");
    }

    const usuarioActualizado = await usuarios.vincularCuenta({
      usuarioId: usuario.id,
      idExterno: authSessionUser.id,
      proveedor: authSessionUser.provider,
      correo: authSessionUser.email ?? usuario.email,
      nombreVisible: usuario.displayName
    });

    const perfil = await usuarios.obtenerPerfilPorUsuarioId(usuario.id);

    return {
      usuario: usuarioActualizado,
      perfil
    };
  };
}
