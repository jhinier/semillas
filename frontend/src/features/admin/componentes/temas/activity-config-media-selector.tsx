import { useMemo, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import type { RecursoMultimedia } from "../../../media/media.api";
import { MediaGalleryDialog } from "../medios/media-gallery-dialog";
import type { ConfiguracionActividad } from "./activity-config-utils";

export function SelectorMedioBiblioteca({
  configuracion,
  claveBase,
  valorUrl,
  tipo,
  titulo,
  descripcion,
  vacio,
  icono,
  recursos,
  uploading,
  onUpload,
  onChange,
}: {
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
}) {
  const [abierto, setAbierto] = useState(false);

  const recursoSeleccionado = useMemo(
    () =>
      recursos.find((recurso) => recurso.url_publica === valorUrl || recurso.id === valorUrl) ?? null,
    [recursos, valorUrl],
  );

  const actualizar = (recurso: RecursoMultimedia | null) => {
    onChange({
      ...configuracion,
      [claveBase]: recurso?.url_publica ?? "",
      [`${claveBase}_recurso_id`]: recurso?.id ?? null,
    });
  };

  return (
    <div className="admin-media-picker">
      <button
        type="button"
        className="admin-media-slot text-left"
        onClick={() => setAbierto(true)}
      >
        <div className="admin-media-slot__preview">
          {recursoSeleccionado?.url_publica ? (
            <img
              src={recursoSeleccionado.url_publica}
              alt={recursoSeleccionado.titulo ?? undefined}
            />
          ) : (
            icono
          )}
        </div>
        <div>
          <strong>{recursoSeleccionado?.titulo ?? vacio}</strong>
          <small>{descripcion}</small>
          <span className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-violet-600">
            <Upload size={14} /> Abrir biblioteca
          </span>
        </div>
      </button>

      {recursoSeleccionado ? (
        <button
          type="button"
          className="admin-secondary-button w-fit"
          onClick={() => actualizar(null)}
        >
          <Trash2 size={14} /> Quitar {tipo}
        </button>
      ) : null}

      <MediaGalleryDialog
        open={abierto}
        title={titulo}
        acceptedTypes={[tipo]}
        resources={recursos}
        selectedResourceId={recursoSeleccionado?.id ?? null}
        isUploading={uploading}
        onClose={() => setAbierto(false)}
        onRemove={() => {
          actualizar(null);
          setAbierto(false);
        }}
        onSelect={(resourceId) => {
          const recurso = recursos.find((item) => item.id === resourceId);
          actualizar(recurso ?? null);
          setAbierto(false);
        }}
        onUpload={(file, _metadata) => onUpload(file, claveBase, tipo)}
      />
    </div>
  );
}
