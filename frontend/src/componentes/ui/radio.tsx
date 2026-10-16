import * as React from "react";

import { unirClases } from "@/lib/utilidades";

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface PropiedadesRadio
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  etiqueta?: React.ReactNode;
  clase?: string;
}

// ── Componente Radio ─────────────────────────────────────────────────────────

export const Radio = React.forwardRef<HTMLInputElement, PropiedadesRadio>(
  ({ etiqueta, clase, className, disabled, ...propiedades }, referencia) => {
    return (
      <label
        className={unirClases(
          "inline-flex items-center gap-2.5 select-none",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        )}
      >
        <div className="relative flex-shrink-0">
          <input
            ref={referencia}
            type="radio"
            disabled={disabled}
            className={unirClases(
              "peer h-[18px] w-[18px] rounded-full border-2 appearance-none",
              "transition-all duration-150 ease-out",
              "border-gray-300 bg-white",
              "checked:border-[#6C3AED] checked:bg-white",
              "focus:outline-none focus:ring-2 focus:ring-[#6C3AED]/20 focus:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className,
              clase,
            )}
            {...propiedades}
          />
          {/* Dot interior */}
          <div className="absolute inset-0 m-auto h-[9px] w-[9px] rounded-full bg-[#6C3AED] scale-0 peer-checked:scale-100 transition-transform duration-150 pointer-events-none" />
        </div>

        {etiqueta && (
          <span className="text-sm text-gray-700 font-medium">{etiqueta}</span>
        )}
      </label>
    );
  },
);

Radio.displayName = "Radio";

// ── Grupo de Radio ───────────────────────────────────────────────────────────

export interface PropiedadesGrupoRadio {
  nombre: string;
  opciones: { valor: string; etiqueta: string; deshabilitado?: boolean }[];
  valorPorDefecto?: string;
  valor?: string;
  onChange?: (valor: string) => void;
  orientacion?: "vertical" | "horizontal";
}

export const GrupoRadio: React.FC<PropiedadesGrupoRadio> = ({
  nombre,
  opciones,
  valorPorDefecto,
  valor,
  onChange,
  orientacion = "vertical",
}) => {
  return (
    <div
      role="radiogroup"
      className={unirClases(
        "flex gap-3",
        orientacion === "vertical" ? "flex-col" : "flex-row flex-wrap",
      )}
    >
      {opciones.map((opcion) => (
        <Radio
          key={opcion.valor}
          name={nombre}
          value={opcion.valor}
          etiqueta={opcion.etiqueta}
          disabled={opcion.deshabilitado}
          defaultChecked={valorPorDefecto === opcion.valor}
          checked={valor !== undefined ? valor === opcion.valor : undefined}
          onChange={onChange ? () => onChange(opcion.valor) : undefined}
        />
      ))}
    </div>
  );
};
