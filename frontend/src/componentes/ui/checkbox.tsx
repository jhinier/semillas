import * as React from "react";

import { unirClases } from "@/lib/utilidades";

// ── Tipos ────────────────────────────────────────────────────────────────────

export type EstadoCheckbox = "default" | "indeterminate";

export interface PropiedadesCheckbox
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  etiqueta?: React.ReactNode;
  indeterminate?: boolean;
  clase?: string;
}

// ── Componente Checkbox ──────────────────────────────────────────────────────

export const Checkbox = React.forwardRef<HTMLInputElement, PropiedadesCheckbox>(
  ({ etiqueta, indeterminate = false, clase, className, disabled, ...propiedades }, referencia) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(referencia, () => inputRef.current!);

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <label
        className={unirClases(
          "inline-flex items-center gap-2.5 select-none",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        )}
      >
        <div className="relative flex-shrink-0">
          <input
            ref={inputRef}
            type="checkbox"
            disabled={disabled}
            className={unirClases(
              "peer h-[18px] w-[18px] rounded-[3px] border-2 appearance-none",
              "transition-all duration-150 ease-out",
              "border-gray-300 bg-white",
              "checked:bg-[#6C3AED] checked:border-[#6C3AED]",
              "indeterminate:bg-[#6C3AED] indeterminate:border-[#6C3AED]",
              "focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className,
              clase,
            )}
            {...propiedades}
          />
          {/* Checkmark SVG */}
          <svg
            className="absolute inset-0 m-auto size-[10px] text-white pointer-events-none hidden peer-checked:block"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* Indeterminate dash */}
          {indeterminate && (
            <svg
              className="absolute inset-0 m-auto size-3 text-white pointer-events-none"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M2 6h8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        {etiqueta && (
          <span className="text-sm text-gray-700 font-medium">{etiqueta}</span>
        )}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
