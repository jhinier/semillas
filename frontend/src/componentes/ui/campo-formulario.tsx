import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export interface PropiedadesCampoFormulario extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
  etiqueta?: string;
  mensajeAyuda?: string;
  mensajeError?: string;
  requerido?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const CampoFormulario: React.FC<PropiedadesCampoFormulario> = ({
  id,
  etiqueta,
  mensajeAyuda,
  mensajeError,
  requerido = false,
  className,
  children,
  ...propiedades
}) => {
  // Intentar clonar el elemento hijo para inyectar automáticamente id y estado de error
  const tieneError = !!mensajeError;
  const childWithProps = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<{ id?: string; estado?: "default" | "error" | "exito" }>, {
        id: id || (children.props as { id?: string }).id,
        estado: tieneError ? "error" : (children.props as { estado?: "default" | "error" | "exito" }).estado || "default",
      })
    : children;

  return (
    <div className={unirClases("flex flex-col gap-1.5 w-full text-left font-sans", className)} {...propiedades}>
      {etiqueta && (
        <label
          htmlFor={id}
          className="text-xs font-bold text-slate-700 flex items-center gap-1 select-none"
        >
          {etiqueta}
          {requerido && <span className="text-[#EE6C4D] font-extrabold text-[13px] leading-none" title="Campo obligatorio">*</span>}
        </label>
      )}

      <div className="relative w-full">
        {childWithProps}
      </div>

      {mensajeError ? (
        <p className="text-[11px] text-[#EE6C4D] font-bold mt-0.5 leading-none transition-all duration-200">
          {mensajeError}
        </p>
      ) : mensajeAyuda ? (
        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-none">
          {mensajeAyuda}
        </p>
      ) : null}
    </div>
  );
};

CampoFormulario.displayName = "CampoFormulario";
