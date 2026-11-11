import { Plus, Trash2 } from "lucide-react";
import { crearIdFila, actualizarFilaTexto } from "./activity-config-utils";

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
    <fieldset className="admin-config-builder__group admin-field--wide">
      <legend>{titulo}</legend>
      {filas.map((valor, indice) => (
        <div className="admin-config-row" key={`${titulo}-${indice}`}>
          <span aria-hidden="true">{indice + 1}</span>
          <input
            type="text"
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
  const filas = opciones.length
    ? opciones
    : [
        { id: "opcion-1", texto: "", correcta: true },
        { id: "opcion-2", texto: "", correcta: false },
      ];

  const seleccionarCorrecta = (indiceSeleccionado: number) => {
    onChange(
      filas.map((fila, posicion) => ({
        ...fila,
        correcta: posicion === indiceSeleccionado,
      }))
    );
  };

  return (
    <fieldset className="activity-options-builder admin-config-builder__group admin-field--wide">
      <legend>{titulo}</legend>
      <p>Escribe de dos a seis opciones y marca una respuesta correcta.</p>
      <div className="activity-options-builder__list">
        {filas.map((opcion, indice) => (
          <div className="activity-option-row" key={opcion.id || `${titulo}-${indice}`}>
            <span className="activity-option-row__label" aria-hidden="true">
              {String.fromCharCode(65 + indice)}
            </span>
            <input
              type="text"
              aria-label={`${titulo} ${indice + 1}`}
              placeholder={`Opción ${String.fromCharCode(65 + indice)}`}
              value={opcion.texto}
              onChange={(event) =>
                onChange(
                  filas.map((fila, posicion) =>
                    posicion === indice ? { ...fila, texto: event.target.value } : fila
                  )
                )
              }
            />
            <label
              className={`activity-option-row__correct ${
                opcion.correcta ? "activity-option-row__correct--active" : ""
              }`}
            >
              <input
                type="radio"
                name={titulo}
                checked={opcion.correcta}
                onChange={() => seleccionarCorrecta(indice)}
              />
              <span>Correcta</span>
            </label>
            <button
              type="button"
              className="admin-icon-button !h-8 !w-8 !text-red-500"
              aria-label={`Eliminar ${titulo.toLowerCase()} ${indice + 1}`}
              disabled={filas.length <= 2}
              onClick={() => {
                const restantes = filas.filter((_, posicion) => posicion !== indice);
                const tieneCorrecta = restantes.some((fila) => fila.correcta);
                onChange(
                  restantes.map((fila, posicion) => ({
                    ...fila,
                    correcta: tieneCorrecta ? fila.correcta : posicion === 0,
                  }))
                );
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="admin-secondary-button w-fit"
        disabled={filas.length >= 6}
        onClick={() =>
          onChange([
            ...filas,
            { id: crearIdFila("opcion"), texto: "", correcta: false },
          ])
        }
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
    <fieldset className="admin-config-builder__group admin-field--wide">
      <legend>{titulo}</legend>
      {filas.map((valor, indice) => (
        <div className="admin-config-row" key={`${titulo}-${indice}`}>
          <span aria-hidden="true">{indice + 1}</span>
          <input
            type="text"
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
