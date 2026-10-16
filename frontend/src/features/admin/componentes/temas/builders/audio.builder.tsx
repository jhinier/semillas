import { FileAudio } from "lucide-react";
import {
  type ConfiguracionActividad,
  campoActualizar,
  obtenerOpcionesConCorrecta,
} from "../activity-config-utils";
import { CampoConfiguracion } from "../activity-config-primitives";
import { ListaOpcionesConCorrecta } from "../activity-config-list-editors";
import { SelectorMedioBiblioteca } from "../activity-config-media-selector";
import type { RecursoMultimedia } from "../../../../media/media.api";

export function AudioBuilder({
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

  return (
    <div className="admin-config-builder__columns">
      <SelectorMedioBiblioteca
        configuracion={configuracion}
        claveBase="audio_url"
        valorUrl={String(configuracion.audio_url ?? "")}
        tipo="audio"
        titulo="Audio para la actividad"
        descripcion="Selecciona un audio existente o súbelo desde la biblioteca de recursos."
        vacio="Elegir audio"
        icono={<FileAudio size={18} />}
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
      <ListaOpcionesConCorrecta
        titulo="Opciones"
        opciones={obtenerOpcionesConCorrecta(configuracion.opciones)}
        etiquetaAgregar="Agregar opción"
        onChange={(opciones) => actualizar("opciones", opciones)}
      />
      <CampoConfiguracion
        label="Transcripción"
        value={String(configuracion.transcripcion ?? "")}
        onChange={(valor) => actualizar("transcripcion", valor)}
        help="Opcional. Útil para accesibilidad y seguimiento."
      />
    </div>
  );
}
