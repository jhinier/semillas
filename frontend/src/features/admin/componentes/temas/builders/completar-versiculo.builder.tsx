import {
  type ConfiguracionActividad,
  campoActualizar,
  obtenerListaTexto,
} from "../activity-config-utils";
import { CampoConfiguracion, AreaConfiguracion } from "../activity-config-primitives";
import { ListaOpcionesTexto } from "../activity-config-list-editors";

export function CompletarVersiculoBuilder({
  configuracion,
  onChange,
}: {
  configuracion: ConfiguracionActividad;
  onChange: (configuracion: ConfiguracionActividad) => void;
}) {
  const actualizar = campoActualizar(configuracion, onChange);

  return (
    <div className="admin-config-builder__columns">
      <AreaConfiguracion
        label="Frase"
        value={String(configuracion.frase ?? "")}
        onChange={(valor) => actualizar("frase", valor)}
        help="Marca el hueco con __."
      />
      <CampoConfiguracion
        label="Respuesta"
        value={String(configuracion.respuesta ?? "")}
        onChange={(valor) => actualizar("respuesta", valor)}
      />
      <ListaOpcionesTexto
        titulo="Banco de palabras"
        valores={obtenerListaTexto(configuracion.opciones)}
        etiquetaAgregar="Agregar palabra"
        onChange={(opciones) => actualizar("opciones", opciones)}
      />
    </div>
  );
}
