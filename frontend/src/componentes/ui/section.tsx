import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { unirClases } from "@/lib/utilidades";

const variantesSeccion = cva(
  "w-full transition-all duration-200",
  {
    variants: {
      variante: {
        default: "",
        white: "bg-white rounded-3xl border border-slate-100 shadow-sm",
        muted: "bg-slate-50 rounded-3xl",
      },
      padding: {
        none: "",
        sm: "p-4 sm:p-5",
        md: "p-5 sm:p-6",
        lg: "p-6 sm:p-8",
      },
    },
    defaultVariants: {
      variante: "default",
      padding: "md",
    },
  }
);

export interface PropiedadesSeccion
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof variantesSeccion> {
  titulo?: React.ReactNode;
  descripcion?: React.ReactNode;
  accion?: React.ReactNode;
  children?: React.ReactNode;
  clase?: string;
  contenidoClassName?: string;
}

export const Section = React.forwardRef<HTMLDivElement, PropiedadesSeccion>(
  (
    {
      variante,
      padding,
      titulo,
      descripcion,
      accion,
      children,
      clase,
      contenidoClassName,
      className,
      ...propiedades
    },
    referencia,
  ) => {
    const tieneHeader = titulo || accion;

    return (
      <div
        ref={referencia}
        className={unirClases(variantesSeccion({ variante, padding }), className, clase)}
        {...propiedades}
      >
        {tieneHeader && (
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              {titulo && (
                <h3 className="text-[clamp(1.35rem,1.55vw,2rem)] font-black leading-none tracking-tight text-slate-900">
                  {titulo}
                </h3>
              )}
              {descripcion && (
                <p className="mt-2 text-xs leading-snug text-slate-500 sm:text-sm">
                  {descripcion}
                </p>
              )}
            </div>
            {accion && <div className="shrink-0 pt-1">{accion}</div>}
          </div>
        )}

        <div className={unirClases("min-w-0", contenidoClassName)}>
          {children}
        </div>
      </div>
    );
  }
);
Section.displayName = "Section";
