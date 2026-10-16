import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export interface PropiedadesTabsLinea {
  tabs: string[];
  activo: string;
  onCambiar: (tab: string) => void;
  clase?: string;
}

export const TabsLinea: React.FC<PropiedadesTabsLinea> = ({
  tabs,
  activo,
  onCambiar,
  clase,
}) => {
  return (
    <div className={unirClases("flex border-b border-[#F1F5F9] w-full", clase)}>
      {tabs.map((tab) => {
        const esActivo = tab === activo;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onCambiar(tab)}
            className={unirClases(
              "px-4 py-2.5 text-[10px] font-bold transition-all border-b-2 -mb-[2px] sm:text-xs",
              esActivo
                ? "border-[#6C3AED] text-[#6C3AED]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};
