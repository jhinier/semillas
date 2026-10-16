import { Plus } from "lucide-react";
import {
  type ConfiguracionActividad,
  crearIdFila,
  obtenerEscenas,
  type OpcionConCorrecta,
  type EscenaEditor,
} from "../activity-config-utils";
import { AreaConfiguracion, CampoConfiguracion } from "../activity-config-primitives";
import { ListaOpcionesConCorrecta } from "../activity-config-list-editors";

export function AventuraBuilder({
  configuracion,
  onChange,
}: {
  configuracion: ConfiguracionActividad;
  onChange: (configuracion: ConfiguracionActividad) => void;
}) {
  const escenas = obtenerEscenas(configuracion.escenas);

  const actualizarEscena = (indice: number, cambios: Partial<EscenaEditor>) => {
    onChange({
      ...configuracion,
      escenas: escenas.map((escena, posicion) =>
        posicion === indice ? { ...escena, ...cambios } : escena
      ),
    });
  };

  const actualizarOpciones = (indiceEscena: number, opciones: OpcionConCorrecta[]) => {
    actualizarEscena(indiceEscena, { opciones });
  };

  const agregarEscena = () => {
    onChange({
      ...configuracion,
      escenas: [
        ...escenas,
        {
          id: crearIdFila("escena"),
          texto: "",
          imagen_url: "",
          opciones: [{ id: crearIdFila("opcion"), texto: "", correcta: true }],
        },
      ],
    });
  };

  return (
    <div className="admin-config-builder__columns">
      {escenas.map((escena, indice) => (
        <fieldset key={escena.id} className="admin-config-builder__group">
          <legend>Escena {indice + 1}</legend>
          <AreaConfiguracion
            label="Texto"
            value={escena.texto}
            onChange={(valor) => actualizarEscena(indice, { texto: valor })}
          />
          <CampoConfiguracion
            label="Imagen URL"
            value={escena.imagen_url}
            onChange={(valor) => actualizarEscena(indice, { imagen_url: valor })}
          />
          <ListaOpcionesConCorrecta
            titulo="Opciones"
            opciones={escena.opciones}
            etiquetaAgregar="Agregar opción"
            onChange={(opciones) => actualizarOpciones(indice, opciones)}
          />
        </fieldset>
      ))}
      <button
        type="button"
        className="admin-secondary-button w-fit"
        onClick={agregarEscena}
      >
        <Plus size={14} /> Agregar escena
      </button>
    </div>
  );
}
