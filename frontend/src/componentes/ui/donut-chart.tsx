import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export type SectorDonut = {
  label: string;
  valor: number;
  color: string;
};

export type DonutChartProps = {
  sectores: SectorDonut[];
  valorTotal?: number;
  etiquetaTotal?: string;
  tamano?: number;
  className?: string;
};

const CIRCUNFERENCIA = 251.327;

function calcularSectores(sectores: SectorDonut[], total: number) {
  return sectores.map((s, i) => {
    const len = (s.valor / total) * CIRCUNFERENCIA;
    const offset = -(sectores.slice(0, i).reduce((acc, x) => acc + (x.valor / total) * CIRCUNFERENCIA, 0));
    return { ...s, len, offset };
  });
}

export function DonutChart({
  sectores,
  valorTotal,
  etiquetaTotal = "Total",
  tamano = 140,
  className,
}: DonutChartProps) {
  const total = valorTotal ?? sectores.reduce((acc, s) => acc + s.valor, 0);
  const sectoresCalc = calcularSectores(sectores, total || 1);

  return (
    <div className={unirClases("flex flex-col", className)}>
      <div className="relative flex items-center justify-center mx-auto" style={{ width: tamano, height: tamano }}>
        <svg width={tamano} height={tamano} viewBox="0 0 100 100" className="transform -rotate-90">
          {sectoresCalc.map((s, i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke={s.color}
              strokeWidth="11"
              strokeDasharray={`${s.len} 251.3`}
              strokeDashoffset={`${s.offset}`}
            />
          ))}
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-slate-800 leading-none">{total}</span>
          <span className="text-[9px] text-slate-400 font-extrabold mt-1 uppercase tracking-wider">
            {etiquetaTotal}
          </span>
        </div>
      </div>
    </div>
  );
}

export type LeyendaDonutProps = {
  sectores: (SectorDonut & { porcentaje: number })[];
  className?: string;
};

export function LeyendaDonut({ sectores, className }: LeyendaDonutProps) {
  return (
    <div className={unirClases("flex flex-col gap-2.5 text-xs font-semibold text-slate-600", className)}>
      {sectores.map((s, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span>{s.label}</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-850">{s.valor}</span>
            <span className="text-slate-400 text-[10px]">({s.porcentaje}%)</span>
          </div>
        </div>
      ))}
    </div>
  );
}
