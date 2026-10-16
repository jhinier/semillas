import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export interface PasoStepper {
  numero: number;
  nombre: string;
  estado: "completado" | "actual" | "pendiente";
  colorHex: string;
}

export interface PropiedadesStepper extends React.HTMLAttributes<HTMLDivElement> {
  pasos: PasoStepper[];
  clase?: string;
}

export const StepperCRECER: React.FC<PropiedadesStepper> = ({ pasos, clase, className, ...propiedades }) => {
  return (
    <div className={unirClases("w-full flex flex-col gap-6", className, clase)} {...propiedades}>
      <div className="relative flex items-start justify-between w-full gap-2 sm:items-center">
        <div className="absolute left-0 right-0 top-5 h-[3px] bg-[#E2E8F0] z-0" />

        {pasos.map((paso, idx) => {
          let estiloBurbuja = {};
          if (paso.estado === "completado" || paso.estado === "actual") {
            estiloBurbuja = {
              backgroundColor: paso.colorHex,
              borderColor: paso.colorHex,
              color: "#FFFFFF",
              zIndex: 10,
            };
          } else {
            estiloBurbuja = {
              backgroundColor: "#FFFFFF",
              borderColor: "#E2E8F0",
              color: "#94A3B8",
              zIndex: 10,
            };
          }

          return (
            <div key={paso.numero} className="relative z-10 flex flex-1 flex-col items-center">
              <div
                style={estiloBurbuja}
                className={unirClases(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold shadow-sm transition-all duration-300 sm:h-10 sm:w-10",
                  paso.estado === "actual" ? "ring-4 ring-offset-2" : ""
                )}
              >
                {paso.numero}
              </div>

              <span className="absolute top-11 text-[10px] font-bold whitespace-nowrap text-gray-800 sm:top-12 sm:text-[11px]">
                {paso.nombre}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] font-bold text-gray-600 sm:gap-6 sm:text-xs">
        <div className="flex items-center gap-2">
          <span className="size-3.5 rounded-full bg-[#6C3AED]" />
          <span>Completado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-3.5 rounded-full border-2 border-[#6C3AED] bg-white" />
          <span>Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-3.5 rounded-full bg-[#E2E8F0]" />
          <span>Pendiente</span>
        </div>
      </div>
    </div>
  );
};
