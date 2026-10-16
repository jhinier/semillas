import type { Usuario } from "../../shared/api/api";

type AccesoAdmin =
  | { permitido: true }
  | { permitido: false; redireccion: "/login" | "/app" };

export function resolverAccesoAdmin(usuario: Pick<Usuario, "rol"> | null | undefined): AccesoAdmin {
  if (!usuario) {
    return { permitido: false, redireccion: "/login" };
  }

  if (usuario.rol !== "administrador") {
    return { permitido: false, redireccion: "/app" };
  }

  return { permitido: true };
}
