import { Plus, Trash2 } from "lucide-react";
import { crearIdFila, actualizarFilaTexto, obtenerListaTexto } from "./activity-config-utils";

export function ListaOpcionesTexto({
  titulo,
  valores,
  etiquetaAgregar,
  onChange,
}: {
  titulo: string;
  valores: string[];
  etiquetaAgregar: string;
  onChange: (valores: string[]) => void;
}) {
  const filas = valores.length ? valores : [""];

  return (
    <fieldset className="admin-config-builder__group">
      <legend>{titulo}</legend>
      {filas.map((valor, indice) => (
        <div className="admin-config-row" key={`${titulo}-${indice}`}>
          <span aria-hidden="true">{indice + 1}</span>
          <input
            aria-label={`${titulo} ${indice + 1}`}
            value={valor}
            onChange={(event) => onChange(actualizarFilaTexto(filas, indice, event.target.value))}
          />
          <button
            type="button"
            className="admin-icon-button !h-8 !w-8 !text-red-500"
            aria-label={`Eliminar ${titulo.toLowerCase()} ${indice + 1}`}
            onClick={() => onChange(filas.filter((_, posicion) => posicion !== indice))}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="admin-secondary-button w-fit"
        onClick={() => onChange([...filas, ""])}
      >
        <Plus size={14} /> {etiquetaAgregar}
      </button>
    </fieldset>
  );
}

export type OpcionConCorrecta = { id: string; texto: string; correcta: boolean };

export function ListaOpcionesConCorrecta({
  titulo,
  opciones,
  etiquetaAgregar,
  onChange,
}: {
  titulo: string;
  opciones: OpcionConCorrecta[];
  etiquetaAgregar: string;
  onChange: (opciones: OpcionConCorrecta[]) => void;
}) {
  const filas = opciones.length ? opciones : [{ id: crearIdFila("opcion"), texto: "", correcta: true }];

  return (
    <fieldset className="admin-config-builder__group">
      <legend>{titulo}</legend>
      {filas.map((opcion, indice) => (
        <div className="admin-config-row admin-config-row--statement" key={opcion.id}>
          <input
            aria-label={`${titulo} ${indice + 1}`}
            value={opcion.texto}
            onChange={(event) =>
              onChange(filas.map((fila, posicion) =>
                posicion === indice ? { ...fila, texto: event.target.value } : fila
              ))
            }
          />
          <label className="activity-option-row__correct">
            <input
              type="radio"
              name={titulo}
              checked={opcion.correcta}
              onChange={() => onChange(filas.map((fila, posicion) => ({ ...fila, correcta: posicion === indice })))}
            />
            <span>Correcta</span>
          </label>
          <button
            type="button"
            className="admin-icon-button !h-8 !w-8 !text-red-500"
            aria-label={`Eliminar ${titulo.toLowerCase()} ${indice + 1}`}
            onClick={() =>
              onChange(
                filas
                  .filter((_, posicion) => posicion !== indice)
                  .map((fila, posicion) => ({ ...fila, correcta: posicion === 0 ? true : fila.correcta }))
              )
            }
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="admin-secondary-button w-fit"
        onClick={() => onChange([...filas, { id: crearIdFila("opcion"), texto: "", correcta: false }])}
      >
        <Plus size={14} /> {etiquetaAgregar}
      </button>
    </fieldset>
  );
}

export function ListaTextoEditor({
  titulo,
  valores,
  etiquetaAgregar,
  onChange,
}: {
  titulo: string;
  valores: string[];
  etiquetaAgregar: string;
  onChange: (valores: string[]) => void;
}) {
  const filas = valores.length ? valores : [""];

  return (
    <fieldset className="admin-config-builder__group">
      <legend>{titulo}</legend>
      {filas.map((valor, indice) => (
        <div className="admin-config-row" key={`${titulo}-${indice}`}>
          <span aria-hidden="true">{indice + 1}</span>
          <input
            aria-label={`${titulo} ${indice + 1}`}
            value={valor}
            onChange={(event) => onChange(actualizarFilaTexto(filas, indice, event.target.value))}
          />
          <button
            type="button"
            className="admin-icon-button !h-8 !w-8 !text-red-500"
            aria-label={`Eliminar ${titulo.toLowerCase()} ${indice + 1}`}
            onClick={() => onChange(filas.filter((_, posicion) => posicion !== indice))}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="admin-secondary-button w-fit"
        onClick={() => onChange([...filas, ""])}
      >
        <Plus size={14} /> {etiquetaAgregar}
      </button>
    </fieldset>
  );
}
