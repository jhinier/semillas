import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export interface PropiedadesBarraProgreso extends React.HTMLAttributes<HTMLDivElement> {
  valor: number;
  maximo?: number;
  mostrarEtiquetas?: boolean;
  etiqueta?: string;
  color?: "morado" | "verde" | "azul" | "naranja";
  clase?: string;
}

export const BarraProgreso: React.FC<PropiedadesBarraProgreso> = ({
  valor,
  maximo,
  mostrarEtiquetas = true,
  etiqueta,
  color = "morado",
  clase,
  className,
  ...propiedades
}) => {
  const porcentaje = maximo ? Math.min((valor / maximo) * 100, 100) : Math.min(Math.max(valor, 0), 100);

  const coloresBarraHex = {
    morado: "#6C3AED",
    verde: "#2E9E5B",
    azul: "#3D8BD4",
    naranja: "#EE6C4D",
  };

  return (
    <div className={unirClases("w-full flex flex-col gap-1.5", className, clase)} {...propiedades}>
      {mostrarEtiquetas && (
        <div className="flex items-center justify-between text-[10px] font-bold text-gray-700 sm:text-[11px]">
          <span>{etiqueta}</span>
          <span className="tabular-nums">{maximo ? `${valor}/${maximo}` : `${Math.round(porcentaje)}%`}</span>
        </div>
      )}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${porcentaje}%`, backgroundColor: coloresBarraHex[color] }}
        />
      </div>
    </div>
  );
};
