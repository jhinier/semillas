import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export interface PropiedadesProgresoCircular extends React.HTMLAttributes<HTMLDivElement> {
  porcentaje: number;
  etiqueta: string;
  color?: "morado" | "verde" | "naranja" | "azul";
  tamano?: number;
  clase?: string;
}

export const ProgresoCircular: React.FC<PropiedadesProgresoCircular> = ({
  porcentaje,
  etiqueta,
  color = "morado",
  tamano = 64,
  clase,
  className,
  ...propiedades
}) => {
  const radio = 24;
  const circunferencia = 2 * Math.PI * radio;
  const offset = circunferencia - (porcentaje / 100) * circunferencia;

  const coloresCirculoHex = {
    morado: "#6C3AED",
    verde: "#2E9E5B",
    naranja: "#EE6C4D",
    azul: "#3D8BD4",
  };

  return (
    <div className={unirClases("flex flex-col items-center gap-1.5", className, clase)} {...propiedades}>
      <div className="relative" style={{ width: tamano, height: tamano }}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx="30"
            cy="30"
            r={radio}
            stroke="#F1F5F9"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="30"
            cy="30"
            r={radio}
            stroke={coloresCirculoHex[color]}
            strokeWidth="5"
            strokeDasharray={circunferencia}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-800" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {porcentaje}%
        </div>
      </div>
      <span className="text-[10px] font-bold text-gray-500 sm:text-[11px]">{etiqueta}</span>
    </div>
  );
};
