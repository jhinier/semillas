export type EstadoTema = "porDefecto" | "enProgreso" | "completada";

export type ProgresoTemaUI = {
  estado: "en_progreso" | "completado";
  porcentaje: number;
  ultimoPasoId: string | null;
};

export type TemaUI = {
  id: string;
  titulo: string;
  descripcion: string;
  senda: string;
  duracion: string;
  xp: number;
  progreso: number;
  favorito: boolean;
  imagenUrl: string | null;
  estado: EstadoTema;
  progresoTema?: ProgresoTemaUI | null;
};
