import type { UsuarioRepository } from "../usuario.repository";

type Dependencias = {
  usuarios: UsuarioRepository;
};

export function crearCasoObtenerPerfil({ usuarios }: Dependencias) {
  return async function obtenerPerfil(usuarioId: string) {
    return usuarios.obtenerPerfilPorUsuarioId(usuarioId);
  };
}
