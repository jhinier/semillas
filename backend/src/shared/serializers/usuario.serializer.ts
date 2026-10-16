export type FilaUsuario = {
  id: string;
  rol: string;
  proveedor: string;
  nombre_visible: string;
  correo: string | null;
};

export function serializarUsuario(fila: FilaUsuario) {
  return {
    id: fila.id,
    rol: fila.rol,
    proveedor: fila.proveedor,
    nombre_visible: fila.nombre_visible,
    correo: fila.correo
  };
}
