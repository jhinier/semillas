import { type ConfiguracionActividad, campoActualizar, obtenerListaTexto } from "../activity-config-utils";
import { CampoConfiguracion } from "../activity-config-primitives";
import { ListaTextoEditor } from "../activity-config-list-editors";

export function SopaLetrasBuilder({
  configuracion,
  onChange,
}: {
  configuracion: ConfiguracionActividad;
  onChange: (configuracion: ConfiguracionActividad) => void;
}) {
  const actualizar = campoActualizar(configuracion, onChange);

  return (
    <div className="admin-config-builder__columns">
      <ListaTextoEditor
        titulo="Palabras"
        valores={obtenerListaTexto(configuracion.palabras)}
        etiquetaAgregar="Agregar palabra"
        onChange={(palabras) => actualizar("palabras", palabras)}
      />
      <CampoConfiguracion
        label="Filas"
        value={String(configuracion.filas ?? 12)}
        type="number"
        onChange={(valor) => actualizar("filas", Number(valor))}
      />
      <CampoConfiguracion
        label="Columnas"
        value={String(configuracion.columnas ?? 12)}
        type="number"
        onChange={(valor) => actualizar("columnas", Number(valor))}
      />
    </div>
  );
}
