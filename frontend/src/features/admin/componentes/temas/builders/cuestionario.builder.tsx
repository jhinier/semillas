import { type ConfiguracionActividad, campoActualizar, obtenerOpcionesConCorrecta } from "../activity-config-utils";
import { ListaOpcionesConCorrecta } from "../activity-config-list-editors";

export function CuestionarioBuilder({
  configuracion,
  onChange,
}: {
  configuracion: ConfiguracionActividad;
  onChange: (configuracion: ConfiguracionActividad) => void;
}) {
  const actualizar = campoActualizar(configuracion, onChange);

  return (
    <div className="admin-config-builder__columns">
      <ListaOpcionesConCorrecta
        titulo="Opciones"
        opciones={obtenerOpcionesConCorrecta(configuracion.opciones)}
        etiquetaAgregar="Agregar opción"
        onChange={(opciones) => actualizar("opciones", opciones)}
      />
    </div>
  );
}
