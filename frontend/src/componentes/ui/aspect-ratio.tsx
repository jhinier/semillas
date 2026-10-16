import * as React from "react";
import { unirClases } from "@/lib/utilidades";

const MAPEO_RATIO: Record<string, string> = {
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  "16/9": "aspect-video",
  "21/9": "aspect-[21/9]",
  "3/2": "aspect-[3/2]",
  "3/4": "aspect-[3/4]",
};

export interface PropiedadesAspectRatio extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: keyof typeof MAPEO_RATIO | string;
  children?: React.ReactNode;
  clase?: string;
}

export const AspectRatio = React.forwardRef<HTMLDivElement, PropiedadesAspectRatio>(
  (
    {
      ratio = "16/9",
      children,
      clase,
      className,
      ...propiedades
    },
    referencia,
  ) => {
    const claseRatio = MAPEO_RATIO[ratio] ?? `aspect-[${ratio}]`;

    return (
      <div
        ref={referencia}
        className={unirClases(claseRatio, "relative overflow-hidden", clase, className)}
        {...propiedades}
      >
        {children}
      </div>
    );
  },
);
AspectRatio.displayName = "AspectRatio";
