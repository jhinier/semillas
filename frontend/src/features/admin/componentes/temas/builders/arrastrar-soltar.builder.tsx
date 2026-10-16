import { type ConfiguracionActividad, campoActualizarVarias, obtenerListaTexto } from "../activity-config-utils";
import { ListaTextoEditor } from "../activity-config-list-editors";

export function ArrastrarSoltarBuilder({
  configuracion,
  onChange,
}: {
  configuracion: ConfiguracionActividad;
  onChange: (configuracion: ConfiguracionActividad) => void;
}) {
  const actualizarVarias = campoActualizarVarias(configuracion, onChange);

  return (
    <ListaTextoEditor
      titulo="Secuencia correcta"
      valores={obtenerListaTexto(configuracion.items)}
      etiquetaAgregar="Agregar paso"
      onChange={(items) => actualizarVarias({ items, orden_correcto: items.map((_, indice) => indice) })}
    />
  );
}
