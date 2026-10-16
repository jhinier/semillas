import { Plus, Trash2 } from "lucide-react";
import type { Tarjeta } from "../activity-config-utils";

export function TarjetasBuilder({
  tarjetas,
  onChange,
}: {
  tarjetas: Tarjeta[];
  onChange: (tarjetas: Tarjeta[]) => void;
}) {
  const filas = tarjetas.length ? tarjetas : [{ id: "tarjeta-1", texto: "" }];

  return (
    <fieldset className="admin-config-builder__group">
      <legend>Tarjetas de memoria</legend>
      <p>Cada tarjeta debe tener un identificador y el texto que verá el estudiante.</p>
      {filas.map((tarjeta, indice) => (
        <div className="admin-config-row admin-config-row--pair" key={tarjeta.id}>
          <input
            aria-label={`Identificador de tarjeta ${indice + 1}`}
            value={tarjeta.id}
            onChange={(event) =>
              onChange(
                filas.map((fila, posicion) =>
                  posicion === indice ? { ...fila, id: event.target.value } : fila
                )
              )
            }
          />
          <input
            aria-label={`Texto de tarjeta ${indice + 1}`}
            value={tarjeta.texto}
            onChange={(event) =>
              onChange(
                filas.map((fila, posicion) =>
                  posicion === indice ? { ...fila, texto: event.target.value } : fila
                )
              )
            }
          />
          <button
            type="button"
            className="admin-icon-button !h-8 !w-8 !text-red-500"
            aria-label={`Eliminar tarjeta ${indice + 1}`}
            onClick={() => onChange(filas.filter((_, posicion) => posicion !== indice))}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="admin-secondary-button w-fit"
        onClick={() => onChange([...filas, { id: `tarjeta-${filas.length + 1}`, texto: "" }])}
      >
        <Plus size={14} /> Agregar tarjeta
      </button>
    </fieldset>
  );
}
