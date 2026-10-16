import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { unirClases } from "@/lib/utilidades";
import { MAPEO_COLORES_DISENO, type ColorDisenoKey } from "./chip-base";

const variantesBadge = cva(
  [
    "inline-flex items-center font-bold rounded-full select-none text-[11px] py-0.5 pl-1 pr-2.5 whitespace-nowrap",
  ]
);

export interface PropiedadesBadge
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof variantesBadge> {
  color?: ColorDisenoKey;
  icono?: React.ReactNode;
  clase?: string;
}

export const Badge = React.forwardRef<HTMLSpanElement, PropiedadesBadge>(
  ({ color = "gris", icono, clase, className, children, style, ...propiedades }, referencia) => {
    const configColor = MAPEO_COLORES_DISENO[color] || MAPEO_COLORES_DISENO.gris;

    return (
      <span
        ref={referencia}
        className={unirClases(variantesBadge(), className, clase)}
        style={{
          backgroundColor: configColor.bg,
          color: configColor.text,
          ...style,
        }}
        {...propiedades}
      >
        {icono && (
          <span
            className="flex items-center justify-center rounded-full size-4.5 flex-shrink-0 text-white mr-1.5"
            style={{ backgroundColor: configColor.border || configColor.text }}
          >
            {React.cloneElement(icono as React.ReactElement<{ className?: string }>, {
              className: "size-2.5 stroke-[3]"
            })}
          </span>
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
