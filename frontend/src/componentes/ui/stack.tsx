import * as React from "react";
import { unirClases } from "@/lib/utilidades";

const MAPEO_GAP: Record<number | string, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
};

export interface PropiedadesStack extends React.HTMLAttributes<HTMLDivElement> {
  direccion?: "vertical" | "horizontal";
  gap?: number | string;
  alineacion?: "start" | "center" | "end" | "stretch";
  envolver?: boolean;
  children?: React.ReactNode;
  clase?: string;
}

function construirClaseGap(gap: number | string): string {
  if (typeof gap === "string") {
    return gap.startsWith("[") ? `gap-${gap}` : MAPEO_GAP[gap] || `gap-${gap}`;
  }
  return MAPEO_GAP[gap] || `gap-${gap}`;
}

export const Stack = React.forwardRef<HTMLDivElement, PropiedadesStack>(
  (
    {
      direccion = "vertical",
      gap = 4,
      alineacion = "stretch",
      envolver = false,
      children,
      clase,
      className,
      ...propiedades
    },
    referencia,
  ) => {
    const clasesDireccion: Record<string, string> = {
      vertical: "flex flex-col",
      horizontal: "flex flex-row",
    };

    const clasesAlineacion: Record<string, string> = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    };

    return (
      <div
        ref={referencia}
        className={unirClases(
          clasesDireccion[direccion],
          construirClaseGap(gap),
          clasesAlineacion[alineacion],
          envolver && "flex-wrap",
          className,
          clase,
        )}
        {...propiedades}
      >
        {children}
      </div>
    );
  }
);
Stack.displayName = "Stack";
