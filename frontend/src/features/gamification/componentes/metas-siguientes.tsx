import * as React from "react";
import { Trophy } from "lucide-react";
import { CabeceraSeccion } from "@/componentes/ui/cabecera-seccion";
import { Card } from "@/componentes/ui/card-base";
import { BarraProgreso } from "@/componentes/ui/barra-progreso";

interface Meta {
  titulo: string;
  descripcion: string;
  valor: number;
  maximo: number;
  color: "morado" | "naranja" | "verde";
}

const metas: Meta[] = [
  { titulo: "Alcanza el Nivel 8", descripcion: "Obtén 1,500 XP en total.", valor: 1250, maximo: 1500, color: "morado" },
  { titulo: "Racha de 14 días", descripcion: "Estudia tu senda por 14 días seguidos.", valor: 12, maximo: 14, color: "naranja" },
  { titulo: "Completa 5 sendas", descripcion: "Termina 5 sendas diferentes.", valor: 3, maximo: 5, color: "verde" },
];

export const MetasSiguientes: React.FC = () => {
  return (
    <Card sombra="sm" className="p-5 flex flex-col gap-4">
      <CabeceraSeccion titulo="Metas siguientes" textoBoton="Ver todas" />
      <div className="grid grid-cols-3 gap-4">
        {metas.map((meta) => (
          <div key={meta.titulo} className="border border-[#F1F5F9] p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#FFFBEB] flex items-center justify-center text-[#FBBF24]">
              <Trophy className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-extrabold text-gray-800 leading-none">{meta.titulo}</h4>
              <p className="text-[10px] text-[#64748B] font-semibold mt-1">{meta.descripcion}</p>
              <div className="mt-3 flex flex-col gap-1">
                <BarraProgreso valor={meta.valor} maximo={meta.maximo} mostrarEtiquetas={false} color={meta.color} />
                <span className="text-[9px] text-gray-400 font-bold self-end mt-0.5">{meta.valor} / {meta.maximo}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
