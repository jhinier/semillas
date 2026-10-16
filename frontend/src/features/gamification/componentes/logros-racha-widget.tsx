import * as React from "react";
import { Flame } from "lucide-react";
import { Card } from "@/componentes/ui/card-base";

export interface LogrosRachaWidgetProps {
  dias: number;
  mensaje: string;
}

export const LogrosRachaWidget: React.FC<LogrosRachaWidgetProps> = ({ dias, mensaje }) => {
  return (
    <Card sombra="sm" hoverEffect="none" className="p-6 flex flex-col">
      <div className="flex items-center justify-between gap-4">
        <div className="text-left flex-1">
          <h2 className="text-base font-black text-slate-800 mb-1">Racha actual</h2>
          <p className="text-xs text-slate-400 leading-normal">{mensaje}</p>
        </div>
        <div className="flex flex-col items-center justify-center bg-orange-50 border border-orange-200 rounded-full w-16 h-16 flex-shrink-0 shadow-sm">
          <Flame className="text-orange-500 fill-orange-500 animate-pulse" size={24} />
          <span className="text-sm font-black text-orange-700 leading-none mt-0.5">{dias}</span>
        </div>
      </div>
    </Card>
  );
};
