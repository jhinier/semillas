import { Image as ImageIcon } from "lucide-react";

import { type ActivityTypeConfigBuilderProps, type ConfiguracionActividad, campoActualizar } from "../activity-config-utils";
import { CampoConfiguracion } from "../activity-config-primitives";
import { SelectorMedioBiblioteca } from "../activity-config-media-selector";

export function RompecabezasBuilder({
  configuracion,
  onChange,
  onUpload,
  resources,
  uploading,
}: {
  configuracion: ConfiguracionActividad;
  onChange: (configuracion: ConfiguracionActividad) => void;
  onUpload: ActivityTypeConfigBuilderProps["onUpload"];
  resources: ActivityTypeConfigBuilderProps["resources"];
  uploading: ActivityTypeConfigBuilderProps["uploading"];
}) {
  const actualizar = campoActualizar(configuracion, onChange);

  return (
    <div className="admin-config-builder__columns">
      <SelectorMedioBiblioteca
        configuracion={configuracion}
        claveBase="imagen"
        valorUrl={String(configuracion.imagen ?? "")}
        tipo="imagen"
        titulo="Imagen para rompecabezas"
        descripcion="Selecciona una imagen existente o súbela desde la biblioteca de recursos."
        vacio="Elegir imagen"
        icono={<ImageIcon size={18} />}
        recursos={resources}
        uploading={uploading}
        onUpload={onUpload}
        onChange={onChange}
      />
      <CampoConfiguracion
        label="Filas"
        value={String(configuracion.filas ?? 3)}
        type="number"
        min={2}
        max={6}
        help="Entre 2 y 6 filas (recomendado: 3)."
        onChange={(valor) => {
          const num = Number.parseInt(valor, 10);
          actualizar("filas", Number.isNaN(num) ? 3 : Math.max(2, Math.min(6, num)));
        }}
      />
      <CampoConfiguracion
        label="Columnas"
        value={String(configuracion.columnas ?? 3)}
        type="number"
        min={2}
        max={6}
        help="Entre 2 y 6 columnas (recomendado: 3)."
        onChange={(valor) => {
          const num = Number.parseInt(valor, 10);
          actualizar("columnas", Number.isNaN(num) ? 3 : Math.max(2, Math.min(6, num)));
        }}
      />
    </div>
  );
}
