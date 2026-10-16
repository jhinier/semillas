import { useState } from "react";
import { PanelSeccionAdmin } from "@/componentes/ui/panel-seccion-admin";

type BarData = {
  dia: string;
  valor: number;
};

type WeeklyProgressChartProps = {
  datos: BarData[];
  onPeriodoChange?: (periodo: string) => void;
};

export function WeeklyProgressChart({ datos, onPeriodoChange }: WeeklyProgressChartProps) {
  const [periodo, setPeriodo] = useState("esta_semana");

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPeriodo(val);
    onPeriodoChange?.(val);
  };

  // Find max value to normalize heights
  const maxValor = Math.max(...datos.map((d) => d.valor), 1);

  return (
    <PanelSeccionAdmin
      titulo="Progreso semanal"
      descripcion="Contenido publicado por semana"
      accion={
        <select
          value={periodo}
          onChange={handleSelect}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-primario"
        >
          <option value="esta_semana">Esta semana</option>
          <option value="mes_pasado">Mes pasado</option>
        </select>
      }
      contenidoClassName="border-b border-slate-100 pb-1"
    >
      <div className="flex h-[180px] items-end justify-between select-none px-2 pt-6">
        {datos.map((d, idx) => {
          const percentageHeight = Math.round((d.valor / maxValor) * 80);
          return (
            <div key={idx} className="group flex flex-1 flex-col items-center">
              <span className="mb-1.5 text-[10px] font-bold text-neutro-oscuro-max opacity-80 transition-opacity group-hover:opacity-100">
                {d.valor}
              </span>
              <div
                className="w-4 cursor-pointer rounded-t-lg bg-primario transition-all duration-500 ease-out hover:bg-primario-oscuro sm:w-6"
                style={{ height: `${percentageHeight}%` }}
              />
              <span className="mt-2 text-[10px] font-bold uppercase leading-none text-neutro">
                {d.dia}
              </span>
            </div>
          );
        })}
      </div>
    </PanelSeccionAdmin>
  );
}
