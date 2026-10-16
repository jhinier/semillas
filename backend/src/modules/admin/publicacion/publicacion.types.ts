import type { CeldaMatriz } from "./matriz-crecer";

export type OpcionPublicacion = { correcta: boolean };

export type ActividadPublicacion = {
  id: string;
  titulo: string;
  consigna: string;
  requiereOpciones?: boolean;
  opciones?: OpcionPublicacion[];
  mediaValida?: boolean;
  configuracionValida?: boolean;
};

export type DatosPublicacion = {
  titulo?: string | null;
  sendaId?: string | null;
  versionBiblicaId?: string | null;
  versiculo?: { texto?: string | null; libroId?: string | null; capitulo?: number | null; numero?: number | null } | null;
  portada?: { id?: string | null; alt?: string | null } | null;
  gruposEdadIds: string[];
  celdasCrecer: CeldaMatriz[];
  actividades: ActividadPublicacion[];
  revisionAprobada: boolean;
  narracionSemillasValida?: boolean;
  markdown?: string | null;
};

export type ErrorPublicacion = {
  codigo: string;
  ruta: string;
  mensaje: string;
  grupoEdadId?: string;
  momento?: string;
};

export type ResultadoValidacionPublicacion = { valido: boolean; errores: ErrorPublicacion[] };
