import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export interface PropiedadesVisuallyHidden extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  clase?: string;
}

export const VisuallyHidden = React.forwardRef<HTMLSpanElement, PropiedadesVisuallyHidden>(
  (
    {
      children,
      clase,
      className,
      ...propiedades
    },
    referencia,
  ) => (
    <span
      ref={referencia}
      className={unirClases(
        "absolute w-px h-px p-0 -m-0 overflow-hidden whitespace-nowrap",
        "[clip:rect(0,0,0,0)] [border:0]",
        clase,
        className,
      )}
      {...propiedades}
    >
      {children}
    </span>
  ),
);
VisuallyHidden.displayName = "VisuallyHidden";
