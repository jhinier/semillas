import { Plus, Trash2 } from "lucide-react";
import { crearIdFila, type Afirmacion } from "../activity-config-utils";

export function VerdaderoFalsoBuilder({
  afirmaciones,
  onChange,
}: {
  afirmaciones: Afirmacion[];
  onChange: (afirmaciones: Afirmacion[]) => void;
}) {
  const filas = afirmaciones.length
    ? afirmaciones
    : [{ id: crearIdFila("afirmacion"), texto: "", es_verdadero: true }];

  return (
    <fieldset className="admin-config-builder__group">
      <legend>Afirmaciones</legend>
      <p>Escribe cada afirmación y marca si es verdadera o falsa.</p>
      {filas.map((afirmacion, indice) => (
        <div
          className="admin-config-row admin-config-row--statement"
          key={afirmacion.id}
        >
          <input
            aria-label={`Afirmación ${indice + 1}`}
            value={afirmacion.texto}
            onChange={(event) =>
              onChange(
                filas.map((fila, posicion) =>
                  posicion === indice ? { ...fila, texto: event.target.value } : fila
                )
              )
            }
          />
          <select
            aria-label={`Valor de la afirmación ${indice + 1}`}
            value={afirmacion.es_verdadero ? "verdadera" : "falsa"}
            onChange={(event) =>
              onChange(
                filas.map((fila, posicion) =>
                  posicion === indice
                    ? { ...fila, es_verdadero: event.target.value === "verdadera" }
                    : fila
                )
              )
            }
          >
            <option value="verdadera">Verdadera</option>
            <option value="falsa">Falsa</option>
          </select>
          <button
            type="button"
            className="admin-icon-button !h-8 !w-8 !text-red-500"
            aria-label={`Eliminar afirmación ${indice + 1}`}
            onClick={() => onChange(filas.filter((_, posicion) => posicion !== indice))}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="admin-secondary-button w-fit"
        onClick={() =>
          onChange([...filas, { id: crearIdFila("afirmacion"), texto: "", es_verdadero: true }])
        }
      >
        <Plus size={14} /> Agregar afirmación
      </button>
    </fieldset>
  );
}
