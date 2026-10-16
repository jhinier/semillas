import * as React from "react";
import { Search } from "lucide-react";
import { unirClases } from "@/lib/utilidades";

export interface PropiedadesCampoBusqueda
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  valor: string;
  onChange: (valor: string) => void;
  ariaLabel?: string;
  contenedorClassName?: string;
  inputClassName?: string;
  icono?: React.ReactNode;
}

export const CampoBusqueda = React.forwardRef<HTMLInputElement, PropiedadesCampoBusqueda>(
  (
    {
      valor,
      onChange,
      ariaLabel,
      contenedorClassName,
      inputClassName,
      icono = <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutro size-4" />,
      className,
      ...props
    },
    referencia,
  ) => {
    return (
      <div className={unirClases("relative flex items-center", contenedorClassName)}>
        {icono}
        <input
          ref={referencia}
          value={valor}
          onChange={(event) => onChange(event.target.value)}
          aria-label={ariaLabel ?? props.placeholder ?? "Campo de busqueda"}
          className={unirClases(
            "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-neutro-oscuro-max outline-none transition-colors focus:border-primario",
            inputClassName,
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

CampoBusqueda.displayName = "CampoBusqueda";
