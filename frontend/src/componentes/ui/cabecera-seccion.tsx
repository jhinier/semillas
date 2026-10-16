import * as React from "react";
import { Boton } from "./boton";
import { unirClases } from "@/lib/utilidades";

type CabeceraSeccionProps = {
  titulo: string;
  descripcion?: string;
  textoBoton?: string;
  onBotonClick?: () => void;
  className?: string;
};

export function CabeceraSeccion({
  titulo,
  descripcion,
  textoBoton,
  onBotonClick,
  className,
}: CabeceraSeccionProps) {
  return (
    <div className={unirClases("flex items-start justify-between gap-4", className)}>
      <div>
        <h3 className="text-lg font-extrabold text-slate-950">{titulo}</h3>
        {descripcion && (
          <p className="mt-1 text-xs font-medium text-slate-500">{descripcion}</p>
        )}
      </div>
      {textoBoton && (
        <Boton variante="contorno" tamano="pequeno" onClick={onBotonClick}>
          {textoBoton}
        </Boton>
      )}
    </div>
  );
}
