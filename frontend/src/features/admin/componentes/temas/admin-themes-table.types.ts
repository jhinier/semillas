export type TemaTableRow = {
  id: string;
  titulo: string;
  resumen: string;
  portadaUrl?: string;
  sendaNombre: string;
  sendaColorHex?: string;
  sendaIcono?: string;
  franjaEdad: string;
  estado: "borrador" | "revision" | "publicado" | "archivado" | string;
  fechaEdicion: string;
  horaEdicion?: string;
  autorNombre: string;
  autorAvatar: string;
};
