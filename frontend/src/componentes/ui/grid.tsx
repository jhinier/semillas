import * as React from "react";
import { unirClases } from "@/lib/utilidades";

type ColumnasResponsivas = {
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
};

const MAPEO_COLUMNAS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
  9: "grid-cols-9",
  10: "grid-cols-10",
  11: "grid-cols-11",
  12: "grid-cols-12",
};

const MAPEO_COLUMNAS_SM: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
};

const MAPEO_COLUMNAS_MD: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
};

const MAPEO_COLUMNAS_LG: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

const MAPEO_COLUMNAS_XL: Record<number, string> = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
  6: "xl:grid-cols-6",
};

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

export interface PropiedadesGrid extends React.HTMLAttributes<HTMLDivElement> {
  columnas?: number | ColumnasResponsivas;
  gap?: number | string;
  alineacion?: "start" | "center" | "end" | "stretch";
  children?: React.ReactNode;
  clase?: string;
}

function construirClasesColumnas(columnas: number | ColumnasResponsivas): string {
  if (typeof columnas === "number") {
    return MAPEO_COLUMNAS[columnas] || "grid-cols-1";
  }

  const clases: string[] = [];

  if (columnas.base) {
    clases.push(MAPEO_COLUMNAS[columnas.base] || "grid-cols-1");
  }
  if (columnas.sm) {
    clases.push(MAPEO_COLUMNAS_SM[columnas.sm] || "");
  }
  if (columnas.md) {
    clases.push(MAPEO_COLUMNAS_MD[columnas.md] || "");
  }
  if (columnas.lg) {
    clases.push(MAPEO_COLUMNAS_LG[columnas.lg] || "");
  }
  if (columnas.xl) {
    clases.push(MAPEO_COLUMNAS_XL[columnas.xl] || "");
  }

  return clases.filter(Boolean).join(" ");
}

function construirClaseGap(gap: number | string): string {
  if (typeof gap === "string") {
    return gap.startsWith("[") ? `gap-${gap}` : MAPEO_GAP[gap] || `gap-${gap}`;
  }
  return MAPEO_GAP[gap] || `gap-${gap}`;
}

export const Grid = React.forwardRef<HTMLDivElement, PropiedadesGrid>(
  (
    {
      columnas = 1,
      gap = 4,
      alineacion = "stretch",
      children,
      clase,
      className,
      ...propiedades
    },
    referencia,
  ) => {
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
          "grid",
          construirClasesColumnas(columnas),
          construirClaseGap(gap),
          clasesAlineacion[alineacion],
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
Grid.displayName = "Grid";
