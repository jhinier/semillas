import * as React from "react";

import { unirClases } from "@/lib/utilidades";

export interface BloqueIconoTextoProps extends React.HTMLAttributes<HTMLDivElement> {
  icono: React.ReactNode;
  titulo: React.ReactNode;
  descripcion?: React.ReactNode;
  iconoCajaClassName?: string;
  iconoClassName?: string;
  tituloClassName?: string;
  descripcionClassName?: string;
}

export function BloqueIconoTexto({
  icono,
  titulo,
  descripcion,
  iconoCajaClassName,
  iconoClassName,
  tituloClassName,
  descripcionClassName,
  className,
  ...propiedades
}: BloqueIconoTextoProps) {
  return (
    <div className={unirClases("flex items-start gap-3 text-left", className)} {...propiedades}>
      <div
        className={unirClases(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          iconoCajaClassName,
        )}
      >
        <span className={unirClases("text-base", iconoClassName)}>{icono}</span>
      </div>

      <div className="min-w-0 flex-1">
        <span className={unirClases("block text-sm font-extrabold leading-tight text-neutro-oscuro-max sm:text-base", tituloClassName)}>
          {titulo}
        </span>
        {descripcion ? (
          <span className={unirClases("mt-1 block text-xs leading-tight text-neutro", descripcionClassName)}>
            {descripcion}
          </span>
        ) : null}
      </div>
    </div>
  );
}
