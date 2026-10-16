import * as React from "react";
import { EscudoSVG } from "@/componentes/ui/escudo-svg";

export interface PropiedadesEscudoEstadistica {
  colorBg: string;
  colorBorder: string;
  icono: React.ReactNode;
}

export const EscudoEstadistica: React.FC<PropiedadesEscudoEstadistica> = ({
  colorBg,
  colorBorder,
  icono,
}) => {
  return (
    <div className="relative w-12 h-14 flex items-center justify-center flex-shrink-0">
      <EscudoSVG fill={colorBg} stroke={colorBorder} strokeWidth={6} />
      <div className="absolute inset-0 flex items-center justify-center text-white">
        {icono}
      </div>
    </div>
  );
};
