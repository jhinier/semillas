import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export interface OpcionTab {
  id: string;
  label: string;
  icono?: React.ReactNode;
  count?: number;
  badgeClassName?: string;
  mostrarBadge?: boolean;
}

export interface PropiedadesTabsOpciones {
  opciones: OpcionTab[];
  activo: string;
  onCambiar: (id: string) => void;
  clase?: string;
  variante?: "linea" | "pildora";
  claseActiva?: string;
  claseInactiva?: string;
}

export const TabsOpciones: React.FC<PropiedadesTabsOpciones> = ({
  opciones,
  activo,
  onCambiar,
  clase,
  variante = "linea",
  claseActiva,
  claseInactiva,
}) => {
  const esVariantePildora = variante === "pildora";

  return (
    <div
      className={unirClases(
        esVariantePildora
          ? "flex flex-wrap gap-2"
          : "flex gap-6 border-b border-slate-100 pb-px mb-6 text-left select-none overflow-x-auto whitespace-nowrap",
        clase,
      )}
    >
      {opciones.map((opcion) => {
        const esActivo = opcion.id === activo;

        return (
          <button
            key={opcion.id}
            type="button"
            onClick={() => onCambiar(opcion.id)}
            className={unirClases(
              esVariantePildora
                ? "px-4 py-2 rounded-xl text-sm font-bold border-0 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600/30 focus-visible:ring-offset-2"
                : "flex items-center gap-2 pb-3 font-bold text-xs transition-all border-b-2 outline-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600/30 sm:text-sm",
              esActivo
                ? esVariantePildora
                  ? "bg-violet-600 text-white shadow-sm"
                  : "border-green-600 text-green-600"
                : esVariantePildora
                  ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  : "border-transparent text-slate-500 hover:text-slate-700",
              esActivo ? claseActiva : claseInactiva,
            )}
          >
            {opcion.icono && <span className="text-[10px]">{opcion.icono}</span>}
            <span>{opcion.label}</span>
            {opcion.count !== undefined && (opcion.mostrarBadge ?? true) && (
              <span
                className={unirClases(
                  "inline-flex px-2 py-0.5 rounded-full text-[10px]",
                  opcion.badgeClassName,
                )}
              >
                {opcion.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
