import * as React from "react";

export type CategoriaLogro = "todas" | "obtenidas" | "pendientes";

export interface LogrosTabsFilterProps {
  activo: CategoriaLogro;
  onChange: (tab: CategoriaLogro) => void;
  totales: {
    total: number;
    obtenidas: number;
    pendientes: number;
  };
}

const opciones: Array<{ id: CategoriaLogro; label: string; countKey: keyof LogrosTabsFilterProps["totales"] }> = [
  { id: "todas", label: "Todas", countKey: "total" },
  { id: "obtenidas", label: "Obtenidas", countKey: "obtenidas" },
  { id: "pendientes", label: "Por obtener", countKey: "pendientes" },
];

export const LogrosTabsFilter: React.FC<LogrosTabsFilterProps> = ({ activo, onChange, totales }) => {
  return (
    <div className="logros-tabs" role="tablist" aria-label="Filtrar insignias">
      {opciones.map((opcion) => {
        const seleccionada = opcion.id === activo;
        return (
          <button
            key={opcion.id}
            type="button"
            role="tab"
            aria-selected={seleccionada}
            className={`logros-tab ${seleccionada ? "is-active" : ""}`}
            onClick={() => onChange(opcion.id)}
          >
            <span>{opcion.label}</span>
            <span className="logros-tab__count">{totales[opcion.countKey]}</span>
          </button>
        );
      })}
    </div>
  );
};
