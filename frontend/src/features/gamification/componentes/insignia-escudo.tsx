import * as React from "react";
import { EscudoSVG } from "@/componentes/ui/escudo-svg";
import { unirClases } from "@/lib/utilidades";

export interface PropiedadesInsigniaEscudo {
  titulo: string;
  subtitulo: string;
  obtenida: boolean;
  colorPrincipal: string;
  colorSecundario: string;
  icono: React.ReactNode;
}

export const InsigniaEscudo: React.FC<PropiedadesInsigniaEscudo> = ({
  titulo,
  subtitulo,
  obtenida,
  colorPrincipal,
  colorSecundario,
  icono,
}) => {
  const gradienteId = `gradiente-${titulo.replace(/\s+/g, "")}`;

  return (
    <div
      className={unirClases(
        "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 text-center",
        obtenida
          ? "bg-white border-[#F1F5F9] shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
          : "bg-[#FAFAFA] border-[#E2E8F0]",
        !obtenida && "opacity-65"
      )}
    >
      <div className="relative w-16 h-18 flex items-center justify-center mb-3">
        <EscudoSVG
          fill={obtenida ? `url(#${gradienteId})` : "#E2E8F0"}
          stroke={obtenida ? colorSecundario : "#CBD5E1"}
          className="w-full h-full drop-shadow-sm"
        >
          {obtenida && (
            <defs>
              <linearGradient
                id={gradienteId}
                x1="0"
                y1="0"
                x2="100"
                y2="115"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={colorPrincipal} />
                <stop offset="100%" stopColor={colorSecundario} />
              </linearGradient>
            </defs>
          )}
        </EscudoSVG>
        <div
          className={unirClases(
            "absolute inset-0 flex items-center justify-center",
            obtenida ? "text-white" : "text-[#94A3B8]"
          )}
        >
          {React.cloneElement(icono as React.ReactElement<{ className?: string }>, {
            className: "size-7 stroke-[2.2] drop-shadow-sm",
          })}
        </div>
      </div>
      <h4 className="text-xs font-bold text-gray-800 mb-1">{titulo}</h4>
      <span
        className={unirClases(
          "text-[10px] font-bold px-2 py-0.5 rounded-full",
          obtenida ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#F1F5F9] text-[#64748B]"
        )}
      >
        {subtitulo}
      </span>
    </div>
  );
};
