import * as React from "react";

import { unirClases } from "@/lib/utilidades";

// ── Tipos ────────────────────────────────────────────────────────────────────

export type EstadoSelect = "default" | "error";

export interface PropiedadesSelect
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  estado?: EstadoSelect;
  mensajeError?: string;
  placeholder?: string;
  clase?: string;
}

// ── Componente Select ────────────────────────────────────────────────────────

export const Select = React.forwardRef<HTMLSelectElement, PropiedadesSelect>(
  (
    {
      estado = "default",
      mensajeError,
      placeholder,
      clase,
      className,
      children,
      disabled,
      value,
      defaultValue,
      ...propiedades
    },
    referencia,
  ) => {
    const clasesBase = [
      "w-full h-11 rounded-xl border bg-white text-sm font-medium",
      "text-gray-900 placeholder:text-gray-400",
      "pl-4 pr-10 appearance-none cursor-pointer",
      "transition-all duration-150 ease-out",
      "focus:outline-none",
    ].join(" ");

    const clasesEstado =
      estado === "error"
        ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
        : "border-gray-200 focus:border-[#6C3AED] focus:ring-2 focus:ring-[#6C3AED]/15";

    const clasesDisabled = disabled
      ? "cursor-not-allowed bg-gray-50 text-gray-400 border-gray-200"
      : "";

    const tieneValor = value !== undefined ? value !== "" : defaultValue !== undefined && defaultValue !== "";

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <div className="relative">
          <select
            ref={referencia}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue ?? ""}
            className={unirClases(
              clasesBase,
              clasesEstado,
              clasesDisabled,
              !tieneValor && !value ? "text-gray-400" : "",
              className,
              clase,
            )}
            aria-invalid={estado === "error" ? true : undefined}
            {...propiedades}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>

          {/* Chevron */}
          <span
            className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>

        {estado === "error" && mensajeError && (
          <p className="text-xs text-red-500 font-medium">{mensajeError}</p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
