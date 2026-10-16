export type FilaPerfil = {
  id: string;
  usuario_id: string;
  apodo: string;
  grupo_edad_id: string | null;
  url_avatar: string | null;
  clave_avatar: string | null;
  prefiere_audio: boolean;
  tamano_texto_preferido: string;
};

export function serializarPerfil(fila: FilaPerfil) {
  return {
    id: fila.id,
    usuario_id: fila.usuario_id,
    apodo: fila.apodo,
    grupo_edad_id: fila.grupo_edad_id,
    url_avatar: fila.url_avatar,
    clave_avatar: fila.clave_avatar,
    prefiere_audio: fila.prefiere_audio,
    tamano_texto_preferido: fila.tamano_texto_preferido
  };
}
