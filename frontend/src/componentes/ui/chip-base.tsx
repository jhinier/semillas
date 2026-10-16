import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { unirClases } from "@/lib/utilidades";

export const MAPEO_COLORES_DISENO = {
  azul: { bg: "#EFF6FF", border: "#3D8BD4", text: "#3D8BD4" },
  morado: { bg: "#FAF5FF", border: "#6C3AED", text: "#6C3AED" },
  naranja: { bg: "#FFF8F1", border: "#EE6C4D", text: "#EE6C4D" },
  verde: { bg: "#F0FDF4", border: "#2E9E5B", text: "#2E9E5B" },
  amarillo: { bg: "#FFFDF5", border: "#F4B740", text: "#F4B740" },
  gris: { bg: "#F8FAFC", border: "#64748B", text: "#64748B" },
  rosa: { bg: "#FDF2F8", border: "#EC4899", text: "#EC4899" },
  moradoOscuro: { bg: "#6C3AED", border: "#6C3AED", text: "#FFFFFF" },
};

export type ColorDisenoKey = keyof typeof MAPEO_COLORES_DISENO;

const variantesChip = cva(
  ["inline-flex items-center gap-2 font-bold transition-all duration-150 select-none whitespace-nowrap pl-1.5"],
  {
    variants: {
      forma: {
        pildora: "rounded-full border pr-3.5 py-1 text-xs",
        badge: "rounded-lg border pr-2 py-0.5 text-[11px]",
        badgePildora: "rounded-full border pr-2.5 py-0.5 text-[11px]",
      },
    },
    defaultVariants: { forma: "pildora" },
  }
);

export interface PropiedadesChip
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof variantesChip> {
  color?: ColorDisenoKey;
  icono?: React.ReactNode;
  clase?: string;
}

export const Chip = React.forwardRef<HTMLDivElement, PropiedadesChip>(
  ({ color = "gris", forma, icono, clase, className, children, style, ...propiedades }, referencia) => {
    const configColor = MAPEO_COLORES_DISENO[color] || MAPEO_COLORES_DISENO.gris;

    return (
      <div
        ref={referencia}
        className={unirClases(variantesChip({ forma }), className, clase)}
        style={{ backgroundColor: configColor.bg, borderColor: configColor.border, color: configColor.text, ...style }}
        {...propiedades}
      >
        {icono && (
          <span className="flex items-center justify-center rounded-full size-5 flex-shrink-0 text-white" style={{ backgroundColor: configColor.border }}>
            {React.cloneElement(icono as React.ReactElement<{ className?: string }>, { className: "size-3 stroke-[3]" })}
          </span>
        )}
        <span>{children}</span>
      </div>
    );
  }
);

Chip.displayName = "Chip";
