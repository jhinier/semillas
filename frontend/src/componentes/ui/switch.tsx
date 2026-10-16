import * as React from "react";

import { unirClases } from "@/lib/utilidades";

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface PropiedadesSwitch
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  etiqueta?: React.ReactNode;
  clase?: string;
  onCheckedChange?: (checked: boolean) => void;
}

// ── Componente Switch ────────────────────────────────────────────────────────

export const Switch = React.forwardRef<HTMLInputElement, PropiedadesSwitch>(
  ({ etiqueta, clase, className, disabled, onCheckedChange, onChange, ...propiedades }, referencia) => {
    return (
      <label
        className={unirClases(
          "inline-flex items-center gap-3 select-none",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        )}
      >
        {/* Track */}
        <div className="relative flex-shrink-0">
          <input
            ref={referencia}
            type="checkbox"
            role="switch"
            disabled={disabled}
            className={unirClases(
              "peer sr-only",
              className,
              clase,
            )}
            onChange={(evento) => {
              onChange?.(evento);
              onCheckedChange?.(evento.currentTarget.checked);
            }}
            {...propiedades}
          />
          {/* Track visual */}
          <div
            className={unirClases(
              "w-10 h-6 rounded-full transition-all duration-200",
              "bg-gray-300 peer-checked:bg-[#6C3AED]",
              "peer-focus:ring-2 peer-focus:ring-[#6C3AED]/20 peer-focus:ring-offset-1",
              "peer-disabled:opacity-50",
            )}
          />
          {/* Thumb */}
          <div
            className={unirClases(
              "absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm",
              "transition-all duration-200",
              "peer-checked:translate-x-4",
            )}
          />
        </div>

        {etiqueta && (
          <span className="text-sm text-gray-700 font-medium">{etiqueta}</span>
        )}
      </label>
    );
  },
);

Switch.displayName = "Switch";
