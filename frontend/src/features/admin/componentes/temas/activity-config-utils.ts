import type { RecursoMultimedia } from "../../../media/media.api";
import { MediaGalleryDialog } from "../medios/media-gallery-dialog";
import { FileAudio, Image as ImageIcon, Plus, Trash2, Upload, Video } from "lucide-react";

export type ConfiguracionActividad = Record<string, unknown>;

export type Afirmacion = { id: string; texto: string; es_verdadero: boolean };
export type Par = { id: string; izquierda: string; derecha: string };
export type Tarjeta = { id: string; texto: string };
export type OpcionConCorrecta = { id: string; texto: string; correcta: boolean };
export type EscenaEditor = { id: string; texto: string; imagen_url: string; opciones: OpcionConCorrecta[] };

let siguienteIdFila = 0;

export function crearIdFila(prefijo: string): string {
  siguienteIdFila += 1;
  return `${prefijo}-${siguienteIdFila}`;
}

export function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

export function obtenerListaTexto(valor: unknown): string[] {
  return Array.isArray(valor) ? valor.filter((elemento): elemento is string => typeof elemento === "string") : [];
}

export function obtenerAfirmaciones(valor: unknown): Afirmacion[] {
  if (!Array.isArray(valor)) return [];

  return valor.filter(esRegistro).map((afirmacion) => ({
    id: typeof afirmacion.id === "string" && afirmacion.id.trim() ? afirmacion.id : crearIdFila("afirmacion"),
    texto: typeof afirmacion.texto === "string" ? afirmacion.texto : "",
    es_verdadero: typeof afirmacion.es_verdadero === "boolean" ? afirmacion.es_verdadero : afirmacion.correcta === true,
  }));
}

export function obtenerPares(valor: unknown): Par[] {
  if (!Array.isArray(valor)) return [];

  return valor.filter(esRegistro).map((par) => ({
    id: typeof par.id === "string" && par.id.trim() ? par.id : crearIdFila("par"),
    izquierda: typeof par.izquierda === "string" ? par.izquierda : "",
    derecha: typeof par.derecha === "string" ? par.derecha : "",
  }));
}

export function obtenerTarjetas(valor: unknown): Tarjeta[] {
  if (!Array.isArray(valor)) return [];

  return valor.filter(esRegistro).map((tarjeta, indice) => ({
    id: typeof tarjeta.id === "string" && tarjeta.id.trim() ? tarjeta.id : `tarjeta-${indice + 1}`,
    texto: typeof tarjeta.texto === "string" ? tarjeta.texto : "",
  }));
}

export function obtenerOpcionesConCorrecta(valor: unknown): OpcionConCorrecta[] {
  if (!Array.isArray(valor)) return [];

  return valor
    .filter(esRegistro)
    .map((opcion, indice) => ({
      id: typeof opcion.id === "string" && opcion.id.trim() ? opcion.id : crearIdFila("opcion"),
      texto: typeof opcion.texto === "string" ? opcion.texto : "",
      correcta: opcion.correcta === true || opcion.esCorrecta === true || indice === 0,
    }));
}

export function obtenerEscenas(valor: unknown): EscenaEditor[] {
  if (!Array.isArray(valor)) return [];

  return valor.filter(esRegistro).map((escena, indice) => ({
    id: typeof escena.id === "string" && escena.id.trim() ? escena.id : crearIdFila("escena"),
    texto: typeof escena.texto === "string" ? escena.texto : "",
    imagen_url: typeof escena.imagen_url === "string" ? escena.imagen_url : "",
    opciones: obtenerOpcionesConCorrecta(escena.opciones).length
      ? obtenerOpcionesConCorrecta(escena.opciones)
      : [{ id: crearIdFila(`escena-${indice + 1}-opcion`), texto: "", correcta: true }],
  }));
}

export function actualizarFilaTexto(valores: string[], indice: number, texto: string): string[] {
  return valores.map((valor, posicion) => posicion === indice ? texto : valor);
}

export function campoActualizar(
  configuracion: ConfiguracionActividad,
  onChange: (config: ConfiguracionActividad) => void,
): (clave: string, valor: unknown) => void {
  return (clave: string, valor: unknown) => onChange({ ...configuracion, [clave]: valor });
}

export function campoActualizarVarias(
  configuracion: ConfiguracionActividad,
  onChange: (config: ConfiguracionActividad) => void,
): (valores: ConfiguracionActividad) => void {
  return (valores: ConfiguracionActividad) => onChange({ ...configuracion, ...valores });
}

export type ActivityTypeConfigBuilderProps = {
  codigo: string;
  configuracion: ConfiguracionActividad;
  onChange: (configuracion: ConfiguracionActividad) => void;
  onUpload: (file: File, key: string, tipo: "imagen" | "audio" | "video") => void;
  resources: RecursoMultimedia[];
  uploading: boolean;
};

export type MediaSelectorProps = {
  configuracion: ConfiguracionActividad;
  claveBase: string;
  valorUrl: string;
  tipo: "imagen" | "audio" | "video";
  titulo: string;
  descripcion: string;
  vacio: string;
  icono: React.ReactNode;
  recursos: RecursoMultimedia[];
  uploading: boolean;
  onUpload: (file: File, key: string, tipo: "imagen" | "audio" | "video") => void;
  onChange: (configuracion: ConfiguracionActividad) => void;
};
