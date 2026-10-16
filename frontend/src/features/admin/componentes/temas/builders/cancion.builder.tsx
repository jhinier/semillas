import { FileAudio } from "lucide-react";
import {
  type ConfiguracionActividad,
  campoActualizar,
  obtenerListaTexto,
} from "../activity-config-utils";
import { ListaTextoEditor } from "../activity-config-list-editors";
import { SelectorMedioBiblioteca } from "../activity-config-media-selector";
import type { RecursoMultimedia } from "../../../../media/media.api";

export function CancionBuilder({
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
        claveBase="cancion_url"
        valorUrl={String(configuracion.cancion_url ?? configuracion.audio_url ?? "")}
        tipo="audio"
        titulo="Audio para la canción"
        descripcion="Selecciona un audio existente o súbelo desde la biblioteca de recursos."
        vacio="Elegir audio"
        icono={<FileAudio size={18} />}
        recursos={recursos}
        uploading={uploading}
        onUpload={onUpload}
        onChange={onChange}
      />
      <ListaTextoEditor
        titulo="Letra"
        valores={obtenerListaTexto(configuracion.letra)}
        etiquetaAgregar="Agregar línea"
        onChange={(letra) => actualizar("letra", letra)}
      />
      <ListaTextoEditor
        titulo="Acciones"
        valores={obtenerListaTexto(configuracion.acciones)}
        etiquetaAgregar="Agregar acción"
        onChange={(acciones) => actualizar("acciones", acciones)}
      />
    </div>
  );
}
