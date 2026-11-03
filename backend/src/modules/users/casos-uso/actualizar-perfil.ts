import type { UsuarioRepository } from "../usuario.repository";

type Dependencias = {
  usuarios: UsuarioRepository;
};

type EntradaActualizarPerfil = {
  apodo?: string;
  grupo_edad_id?: string | null;
  url_avatar?: string | null;
  clave_avatar?: string | null;
  prefiere_audio?: boolean;
  tamano_texto_preferido?: "pequeno" | "mediano" | "grande";
};

export function crearCasoActualizarPerfil({ usuarios }: Dependencias) {
  return async function actualizarPerfil(usuarioId: string, entrada: EntradaActualizarPerfil) {
    const avatarValor = entrada.url_avatar ?? entrada.clave_avatar;
    const claveValor = entrada.clave_avatar ?? entrada.url_avatar;

    return usuarios.actualizarPerfilPorUsuarioId(usuarioId, {
      apodo: entrada.apodo,
      grupoEdadId: entrada.grupo_edad_id,
      urlAvatar: avatarValor,
      claveAvatar: claveValor,
      prefiereAudio: entrada.prefiere_audio,
      tamanoTextoPreferido: entrada.tamano_texto_preferido
    });
  };
}
