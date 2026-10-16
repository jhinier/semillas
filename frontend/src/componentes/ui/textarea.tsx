import * as React from "react";

import { unirClases } from "@/lib/utilidades";

// ── Tipos ────────────────────────────────────────────────────────────────────

export type EstadoTextarea = "default" | "error";

export interface PropiedadesTextarea
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  estado?: EstadoTextarea;
  mensajeError?: string;
  maxCaracteres?: number;
  mostrarContador?: boolean;
  clase?: string;
}

// ── Componente Textarea ──────────────────────────────────────────────────────

export const Textarea = React.forwardRef<HTMLTextAreaElement, PropiedadesTextarea>(
  (
    {
      estado = "default",
      mensajeError,
      maxCaracteres,
      mostrarContador = false,
      clase,
      className,
      disabled,
      value,
      defaultValue,
      onChange,
      ...propiedades
    },
    referencia,
  ) => {
    const [conteo, setConteo] = React.useState(() => {
      const inicial = (value ?? defaultValue ?? "") as string;
      return inicial.length;
    });

    const manejarCambio = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setConteo(e.target.value.length);
      onChange?.(e);
    };

    const clasesBase = [
      "w-full rounded-xl border bg-white text-sm font-medium",
      "text-gray-900 placeholder:text-gray-400 placeholder:font-normal",
      "p-4 resize-none min-h-[96px]",
      "transition-all duration-150 ease-out",
      "focus:outline-none",
      "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200",
    ].join(" ");

    const clasesEstado =
      estado === "error"
        ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
        : "border-gray-200 focus:border-[#6C3AED] focus:ring-2 focus:ring-[#6C3AED]/15";

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <textarea
          ref={referencia}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onChange={manejarCambio}
          maxLength={maxCaracteres}
          className={unirClases(clasesBase, clasesEstado, className, clase)}
          aria-invalid={estado === "error" ? true : undefined}
          {...propiedades}
        />

        <div className="flex items-center justify-between">
          {estado === "error" && mensajeError ? (
            <p className="text-xs text-red-500 font-medium">{mensajeError}</p>
          ) : (
            <span />
          )}
          {(mostrarContador || maxCaracteres) && (
            <p className="text-xs text-gray-400 tabular-nums">
              {conteo} / {maxCaracteres ?? "∞"}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
