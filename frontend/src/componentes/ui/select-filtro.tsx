// frontend/src/componentes/ui/select-filtro.tsx
import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export interface OpcionFiltro {
  id: string;
  nombre: string;
}

export interface PropiedadesSelectFiltro extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  opciones: OpcionFiltro[];
  placeholder?: string;
  etiquetaAria: string;
  variante?: "pildora" | "cuadrado";
  clase?: string;
}

export const SelectFiltro = React.forwardRef<HTMLSelectElement, PropiedadesSelectFiltro>(
  ({ opciones, placeholder, etiquetaAria, variante = "pildora", clase, className, disabled, ...propiedades }, referencia) => {
    const clasesBase = variante === "pildora"
      ? "w-full px-4 pr-10 py-2.5 rounded-full border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 appearance-none cursor-pointer transition-all"
      : "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 appearance-none cursor-pointer transition-all";

    const clasesFocus = variante === "pildora"
      ? "focus:outline-none focus:ring-2 focus:ring-[#2E9E5B]/30 focus:border-[#2E9E5B]"
      : "focus:outline-none focus:ring-2 focus:ring-[#2E9E5B]/10 focus:border-[#2E9E5B]";

    const clasesDisabled = disabled ? "opacity-50 cursor-not-allowed" : "";

    return (
      <div className="relative">
        <select
          ref={referencia}
          disabled={disabled}
          aria-label={etiquetaAria}
          className={unirClases(clasesBase, clasesFocus, clasesDisabled, className, clase)}
          {...propiedades}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {opciones.map((opcion) => (
            <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>
          ))}
        </select>
        <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
      </div>
    );
  }
);

SelectFiltro.displayName = "SelectFiltro";
