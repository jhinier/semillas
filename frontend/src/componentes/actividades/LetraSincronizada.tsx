import { useMemo } from "react";
import { FileText } from "lucide-react";
import { parseLrc, type LineaLRC } from "../../lib/lrc-parser";

interface LetraSincronizadaProps {
  letra: string;
  currentTime: number;
}

export function LetraSincronizada({ letra, currentTime }: LetraSincronizadaProps) {
  const lineas = useMemo(() => parseLrc(letra), [letra]);

  const obtenerLineaActiva = (tiempoActual: number, lineasLrc: LineaLRC[]): number => {
    let activa = -1;
    for (let i = 0; i < lineasLrc.length; i++) {
      if (lineasLrc[i]!.tiempo <= tiempoActual) {
        activa = i;
      } else {
        break;
      }
    }
    return activa;
  };

  const indiceActivo = obtenerLineaActiva(currentTime, lineas);
  const tieneTiempos = lineas.some((l) => l.tiempo > 0);

  return (
    <div className="flex-1 bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100 flex flex-col md:h-[500px]">
      <h3 className="text-lg md:text-xl font-bold text-slate-700 mb-6 flex items-center gap-3">
        <FileText className="w-6 h-6 text-amber-500" /> Letra de la canción
      </h3>
      <div className="overflow-y-auto pr-4 flex-1 scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent space-y-4">
        {tieneTiempos ? (
          lineas.map((linea, index) => {
            const esActivo = index === indiceActivo;
            return (
              <p
                key={index}
                className={`text-xl font-medium transition-colors duration-300 ${
                  esActivo
                    ? "text-amber-600 font-bold scale-105 origin-left"
                    : index < indiceActivo
                    ? "text-slate-700"
                    : "text-slate-300"
                }`}
              >
                {linea.texto || " "}
              </p>
            );
          })
        ) : (
          <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap font-medium">
            {letra}
          </div>
        )}
      </div>
    </div>
  );
}
