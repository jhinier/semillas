import * as React from "react";
import { Award, Book, Flame, Download } from "lucide-react";
import { unirClases } from "@/lib/utilidades";
import { Card } from "./card-base";
import { BarraProgreso } from "./barra-progreso";
import { EtiquetaPildora } from "./etiqueta-pildora";

export interface PropiedadesCardInsignia {
  titulo: string;
  descripcion: string;
  obtenida: boolean;
  color: "verde" | "morado" | "amarillo" | "gris";
  icono: React.ReactNode;
  progresoActual?: number;
  progresoMaximo?: number;
  clase?: string;
}

export const CardInsignia: React.FC<PropiedadesCardInsignia> = ({
  titulo,
  descripcion,
  obtenida,
  color,
  icono,
  progresoActual,
  progresoMaximo,
  clase,
}) => {
  const colorConfigs = {
    verde: {
      bg: "linear-gradient(135deg, #2E9E5B, #123B2C)",
      border: "#16A34A",
      bgPildora: "#DCFCE7",
      textPildora: "#16A34A",
    },
    morado: {
      bg: "linear-gradient(135deg, #6C3AED, #4C1D95)",
      border: "#5B30C8",
      bgPildora: "#FAF5FF",
      textPildora: "#6C3AED",
    },
    amarillo: {
      bg: "linear-gradient(135deg, #F4B740, #D97706)",
      border: "#D97706",
      bgPildora: "#FFFDF5",
      textPildora: "#D97706",
    },
    gris: {
      bg: "linear-gradient(135deg, #94A3B8, #475569)",
      border: "#64748B",
      bgPildora: "#F1F5F9",
      textPildora: "#64748B",
    },
  };

  const config = colorConfigs[color] || colorConfigs.gris;

  return (
    <Card
      sombra="sm"
      clase={unirClases("p-5 flex flex-col items-center justify-between text-center h-[260px] max-w-[200px] w-full", clase)}
      className={obtenida ? "" : "opacity-70"}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-16 h-18 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 100 115" className="w-full h-full" fill="none">
            <path
              d="M50 0C77.7778 0 95.8333 13.5833 100 40.8333C100 78.4333 75.9259 102.35 50 115C24.0741 102.35 0 78.4333 0 40.8333C4.16667 13.5833 22.2222 0 50 0Z"
              fill={obtenida ? config.bg : "#CBD5E1"}
            />
            <path
              d="M50 4C74.7778 4 91.8333 16.5833 96 42.8333C96 75.4333 73.9259 97.35 50 109C26.0741 97.35 4 75.4333 4 42.8333C8.16667 16.5833 25.2222 4 50 4Z"
              stroke={obtenida ? config.border : "#94A3B8"}
              strokeWidth="4"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-white">
            {React.cloneElement(icono as React.ReactElement<{ className?: string }>, {
              className: "size-7 stroke-[2.2]",
            })}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-black text-slate-800 leading-tight mb-1">{titulo}</h4>
          <p className="text-xs text-slate-400 font-semibold leading-snug line-clamp-2 px-1">
            {descripcion}
          </p>
        </div>
      </div>

      <div className="w-full mt-4">
        {obtenida ? (
          <EtiquetaPildora variante="exito" clase="w-full justify-center">
            ¡Logro obtenido!
          </EtiquetaPildora>
        ) : progresoActual !== undefined && progresoMaximo !== undefined ? (
          <div className="flex flex-col gap-1 w-full">
            <BarraProgreso
              valor={progresoActual}
              maximo={progresoMaximo}
              mostrarEtiquetas={false}
              color={color === "amarillo" ? "naranja" : color === "gris" ? "azul" : color}
            />
            <span className="text-[10px] text-slate-400 font-bold self-end mt-0.5">
              {progresoActual} / {progresoMaximo}
            </span>
          </div>
        ) : (
          <EtiquetaPildora variante="bloqueado" clase="w-full justify-center">
            Bloqueado
          </EtiquetaPildora>
        )}
      </div>
    </Card>
  );
};
