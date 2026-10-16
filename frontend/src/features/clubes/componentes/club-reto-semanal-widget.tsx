import * as React from "react";
import { Target } from "lucide-react";
import { Card } from "@/componentes/ui/card-base";
import { BarraProgreso } from "@/componentes/ui/barra-progreso";

export interface ClubRetoSemanalWidgetProps {
  completadas: number;
  meta: number;
}

export const ClubRetoSemanalWidget: React.FC<ClubRetoSemanalWidgetProps> = ({
  completadas,
  meta,
}) => {
  return (
    <Card sombra="sm" className="p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
          <Target size={16} />
        </div>
        <div className="text-left">
          <h3 className="text-sm font-extrabold text-slate-800 leading-tight">Reto semanal</h3>
          <p className="text-[10px] text-slate-400">Completa {meta} actividades esta semana.</p>
        </div>
      </div>

      <div className="flex flex-col items-center mb-4">
        <span className="text-3xl font-black text-violet-600">{completadas} / {meta}</span>
      </div>

      <BarraProgreso valor={completadas} maximo={meta} color="morado" mostrarEtiquetas={false} />
    </Card>
  );
};
