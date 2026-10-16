import { Video } from "lucide-react";
import {
  type ConfiguracionActividad,
  campoActualizar,
  obtenerListaTexto,
} from "../activity-config-utils";
import { CampoConfiguracion } from "../activity-config-primitives";
import { ListaOpcionesTexto } from "../activity-config-list-editors";
import { SelectorMedioBiblioteca } from "../activity-config-media-selector";
import type { RecursoMultimedia } from "../../../../media/media.api";

export function VideoBuilder({
  configuracion,
  onChange,
  recursos,
  onUpload,
  uploading,
}: {
  configuracion: ConfiguracionActividad;
  onChange: (configuracion: ConfiguracionActividad) => void;
  recursos: RecursoMultimedia[];
  onUpload: (file: File, key: string, tipo: "imagen" | "audio" | "video") => void;
  uploading: boolean;
}) {
  const actualizar = campoActualizar(configuracion, onChange);
  const opciones = obtenerListaTexto(configuracion.opciones);

  return (
    <div className="admin-config-builder__columns">
      <SelectorMedioBiblioteca
        configuracion={configuracion}
        claveBase="video_url"
        valorUrl={String(configuracion.video_url ?? "")}
        tipo="video"
        titulo="Video para la actividad"
        descripcion="Selecciona un video existente o súbelo desde la biblioteca de recursos."
        vacio="Elegir video"
        icono={<Video size={18} />}
        recursos={recursos}
        uploading={uploading}
        onUpload={onUpload}
        onChange={onChange}
      />
      <CampoConfiguracion
        label="Pregunta"
        value={String(configuracion.pregunta ?? "")}
        onChange={(valor) => actualizar("pregunta", valor)}
      />
      <ListaOpcionesTexto
        titulo="Opciones"
        valores={opciones}
        etiquetaAgregar="Agregar opción"
        onChange={(next) => actualizar("opciones", next)}
      />
      <CampoConfiguracion
        label="Respuesta correcta"
        type="number"
        value={String(configuracion.respuesta_correcta ?? 0)}
        onChange={(valor) => actualizar("respuesta_correcta", Number(valor))}
        help="Índice de la opción correcta, empezando en 0."
      />
    </div>
  );
}
