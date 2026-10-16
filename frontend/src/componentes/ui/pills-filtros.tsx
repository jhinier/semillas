import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export interface PropiedadesPillsFiltros {
  opciones: string[];
  activo: string;
  onCambiar: (opcion: string) => void;
  clase?: string;
}

export const PillsFiltros: React.FC<PropiedadesPillsFiltros> = ({
  opciones,
  activo,
  onCambiar,
  clase,
}) => {
  return (
    <div className={unirClases("flex flex-wrap gap-2", clase)}>
      {opciones.map((opcion) => {
        const esActivo = opcion === activo;
        return (
          <button
            key={opcion}
            type="button"
            onClick={() => onCambiar(opcion)}
            className={unirClases(
              "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border",
              esActivo
                ? "bg-[#6C3AED] border-[#6C3AED] text-white shadow-sm"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
            )}
          >
            {opcion}
          </button>
        );
      })}
    </div>
  );
};
