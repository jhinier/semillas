import * as React from "react";
import { Trophy } from "lucide-react";
import { Card } from "@/componentes/ui/card-base";
import { BarraProgreso } from "@/componentes/ui/barra-progreso";
import bannerKidsImg from "@/assets/images/Ilustraciones/Ninos 2.webp";

export interface ClubRetosCardProps {
  progresoPorcentaje: number;
  metaActividades: number;
  actualActividades: number;
}

export const ClubRetosCard: React.FC<ClubRetosCardProps> = ({
  progresoPorcentaje,
  metaActividades,
  actualActividades,
}) => {
  return (
    <Card sombra="sm" className="p-6 flex flex-col justify-between">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 flex-shrink-0">
          <Trophy size={18} className="fill-amber-500/10" />
        </div>
        <div className="text-left flex-1 min-w-0">
          <h3 className="text-base font-black text-slate-800 leading-tight mb-1">
            Reto cooperativo de la semana
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-semibold">
            ¡Juntos podemos más! Completen actividades para alcanzar la meta del club.
          </p>
        </div>
      </div>

      {/* Centro Gráfico */}
      <div className="flex flex-col items-center justify-center my-6 flex-grow">
        <div className="flex items-center gap-6">
          {/* Círculo de progreso */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Progreso del club</span>
            <span className="text-4xl font-black text-green-600 leading-none">{progresoPorcentaje}%</span>
          </div>
          {/* Ilustración de niños */}
          <div className="w-24 h-20 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100 flex-shrink-0">
            <img src={bannerKidsImg} alt="Reto" className="h-full object-cover scale-110" />
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="w-full flex flex-col gap-2">
        {/* Barra de progreso */}
        <BarraProgreso valor={actualActividades} maximo={metaActividades} color="verde" mostrarEtiquetas={false} />
        <div className="flex justify-between items-center text-xs">
          <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
            ⭐ Meta: {metaActividades} actividades
          </span>
          <span className="font-black text-slate-800">{actualActividades} / {metaActividades}</span>
        </div>
      </div>
    </Card>
  );
};
