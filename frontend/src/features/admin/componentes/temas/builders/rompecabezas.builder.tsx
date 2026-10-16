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
        onChange={(valor) => actualizar("filas", Number(valor))}
      />
      <CampoConfiguracion
        label="Columnas"
        value={String(configuracion.columnas ?? 3)}
        type="number"
        onChange={(valor) => actualizar("columnas", Number(valor))}
      />
    </div>
  );
}
