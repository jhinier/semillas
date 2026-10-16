import * as React from "react";
import { unirClases } from "@/lib/utilidades";

const MAPEO_ESPACIADO: Record<number, string> = {
  0: "h-0",
  1: "h-1",
  2: "h-2",
  3: "h-3",
  4: "h-4",
  5: "h-5",
  6: "h-6",
  8: "h-8",
  10: "h-10",
  12: "h-12",
  16: "h-16",
  20: "h-20",
  24: "h-24",
};

const MAPEO_ESPACIADO_X: Record<number, string> = {
  0: "w-0",
  1: "w-1",
  2: "w-2",
  3: "w-3",
  4: "w-4",
  5: "w-5",
  6: "w-6",
  8: "w-8",
  10: "w-10",
  12: "w-12",
  16: "w-16",
  20: "w-20",
  24: "w-24",
};

export interface PropiedadesSpacer extends React.HTMLAttributes<HTMLDivElement> {
  talla?: number;
  direccion?: "vertical" | "horizontal";
  clase?: string;
}

export const Spacer = React.forwardRef<HTMLDivElement, PropiedadesSpacer>(
  (
    {
      talla = 4,
      direccion = "vertical",
      clase,
      className,
      ...propiedades
    },
    referencia,
  ) => {
    const mapa = direccion === "vertical" ? MAPEO_ESPACIADO : MAPEO_ESPACIADO_X;
    const claseTalla = mapa[talla] ?? (direccion === "vertical" ? `h-${talla}` : `w-${talla}`);

    return (
      <div
        ref={referencia}
        role="separator"
        aria-orientation={direccion === "vertical" ? "vertical" : "horizontal"}
        className={unirClases(claseTalla, clase, className)}
        {...propiedades}
      />
    );
  },
);
Spacer.displayName = "Spacer";
