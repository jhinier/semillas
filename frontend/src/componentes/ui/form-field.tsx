import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export interface PropiedadesFormField extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  requerido?: boolean;
  error?: string;
  textoAyuda?: string;
  children: React.ReactNode;
  clase?: string;
  labelClassName?: string;
  contenidoClassName?: string;
}

export const FormField = React.forwardRef<HTMLDivElement, PropiedadesFormField>(
  (
    {
      label,
      requerido = false,
      error,
      textoAyuda,
      children,
      clase,
      labelClassName,
      contenidoClassName,
      className,
      id,
      ...propiedades
    },
    referencia,
  ) => {
    const idCampo = id || `campo-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div
        ref={referencia}
        className={unirClases("flex flex-col gap-1.5", className, clase)}
        {...propiedades}
      >
        <label
          htmlFor={idCampo}
          className={unirClases(
            "text-xs font-bold text-slate-700",
            labelClassName,
          )}
        >
          {label}
          {requerido && <span className="text-red-500 ml-0.5">*</span>}
        </label>

        <div className={unirClases("relative", contenidoClassName)}>
          {React.isValidElement(children)
            ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
                id: idCampo,
                "aria-describedby": error
                  ? `${idCampo}-error`
                  : textoAyuda
                    ? `${idCampo}-ayuda`
                    : undefined,
                "aria-invalid": error ? true : undefined,
              })
            : children}
        </div>

        {error && (
          <p
            id={`${idCampo}-error`}
            className="text-xs font-medium text-red-500"
            role="alert"
          >
            {error}
          </p>
        )}

        {!error && textoAyuda && (
          <p
            id={`${idCampo}-ayuda`}
            className="text-[10px] text-slate-400 font-bold leading-relaxed"
          >
            {textoAyuda}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";
