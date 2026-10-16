import { Plus, Trash2 } from "lucide-react";
import { crearIdFila, type Par } from "../activity-config-utils";

export function ParesBuilder({
  pares,
  onChange,
}: {
  pares: Par[];
  onChange: (pares: Par[]) => void;
}) {
  const filas = pares.length
    ? pares
    : [{ id: crearIdFila("par"), izquierda: "", derecha: "" }];

  return (
    <fieldset className="admin-config-builder__group">
      <legend>Pares para relacionar</legend>
      <p>Conecta cada concepto con su respuesta correspondiente.</p>
      {filas.map((par, indice) => (
        <div className="admin-config-row admin-config-row--pair" key={par.id}>
          <input
            aria-label={`Concepto ${indice + 1}`}
            placeholder="Concepto"
            value={par.izquierda}
            onChange={(event) =>
              onChange(
                filas.map((fila, posicion) =>
                  posicion === indice ? { ...fila, izquierda: event.target.value } : fila
                )
              )
            }
          />
          <input
            aria-label={`Respuesta ${indice + 1}`}
            placeholder="Respuesta"
            value={par.derecha}
            onChange={(event) =>
              onChange(
                filas.map((fila, posicion) =>
                  posicion === indice ? { ...fila, derecha: event.target.value } : fila
                )
              )
            }
          />
          <button
            type="button"
            className="admin-icon-button !h-8 !w-8 !text-red-500"
            aria-label={`Eliminar par ${indice + 1}`}
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
          onChange([...filas, { id: crearIdFila("par"), izquierda: "", derecha: "" }])
        }
      >
        <Plus size={14} /> Agregar par
      </button>
    </fieldset>
  );
}
