import { type ConfiguracionActividad, campoActualizar, obtenerListaTexto } from "../activity-config-utils";
import { ListaTextoEditor } from "../activity-config-list-editors";

export function ManualidadBuilder({
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
        titulo="Materiales"
        valores={obtenerListaTexto(configuracion.materiales)}
        etiquetaAgregar="Agregar material"
        onChange={(materiales) => actualizar("materiales", materiales)}
      />
      <ListaTextoEditor
        titulo="Pasos"
        valores={obtenerListaTexto(configuracion.pasos)}
        etiquetaAgregar="Agregar paso"
        onChange={(pasos) => actualizar("pasos", pasos)}
      />
    </div>
  );
}
