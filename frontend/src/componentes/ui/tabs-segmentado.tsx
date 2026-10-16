import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export interface OpcionSegmentada {
  id: string;
  etiqueta: string;
  icono?: React.ReactNode;
}

export interface PropiedadesTabsSegmentado {
  opciones: OpcionSegmentada[];
  activo: string;
  onCambiar: (id: string) => void;
  clase?: string;
}

export const TabsSegmentado: React.FC<PropiedadesTabsSegmentado> = ({
  opciones,
  activo,
  onCambiar,
  clase,
}) => {
  return (
    <div className={unirClases("inline-flex p-1 bg-[#F1F5F9] rounded-xl", clase)}>
      {opciones.map((op) => {
        const esActivo = op.id === activo;
        return (
          <button
            key={op.id}
            type="button"
            onClick={() => onCambiar(op.id)}
            className={unirClases(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all",
              esActivo
                ? "bg-[#6C3AED] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {op.icono && <span className="flex-shrink-0">{op.icono}</span>}
            <span>{op.etiqueta}</span>
          </button>
        );
      })}
    </div>
  );
};
