import * as React from "react";
import { unirClases } from "@/lib/utilidades";
import { Card } from "./card-base";
import { Chip } from "./chip";
import { BarraProgreso } from "./barra-progreso";
import { Boton } from "./boton";

interface PropiedadesCardPerfil {
  nombre: string;
  nivel: number;
  racha: number;
  lecciones: number;
  logros: number;
  xpActual: number;
  xpMaximo: number;
  avatarUrl?: string;
  onVerPerfil?: () => void;
  clase?: string;
}

export const CardPerfil: React.FC<PropiedadesCardPerfil> = ({
  nombre,
  nivel,
  racha,
  lecciones,
  logros,
  xpActual,
  xpMaximo,
  avatarUrl,
  onVerPerfil,
  clase,
}) => {
  return (
    <Card sombra="sm" hoverEffect="none" clase={unirClases("p-5 flex flex-col gap-4 bg-white w-full max-w-[280px]", clase)}>
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full border-2 border-[#6C3AED]/20 bg-cover bg-center flex-shrink-0"
          style={{
            backgroundImage: avatarUrl ? `url('${avatarUrl}')` : "url('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80')",
          }}
        />
        <div className="text-left">
          <h4 className="text-xs font-black text-slate-800 leading-none">{nombre}</h4>
          <span className="inline-flex mt-1.5">
            <Chip color="morado" forma="badgePildora">
              Nivel {nivel}
            </Chip>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center text-xs text-slate-400 font-bold mb-1">
          <span>{xpActual} / {xpMaximo} XP</span>
        </div>
        <BarraProgreso valor={xpActual} maximo={xpMaximo} mostrarEtiquetas={false} color="morado" />
      </div>

      <div className="grid grid-cols-3 gap-2 border-y border-slate-100 py-3 text-center">
        <div>
          <h5 className="text-xs font-black text-slate-800 leading-none">{racha}</h5>
          <span className="text-[10px] text-slate-400 font-bold block mt-1">días</span>
        </div>
        <div>
          <h5 className="text-xs font-black text-slate-800 leading-none">{lecciones}</h5>
          <span className="text-[10px] text-slate-400 font-bold block mt-1">lecciones</span>
        </div>
        <div>
          <h5 className="text-xs font-black text-slate-800 leading-none">{logros}</h5>
          <span className="text-[10px] text-slate-400 font-bold block mt-1">logros</span>
        </div>
      </div>

      <Boton variante="contorno" className="w-full text-xs py-1.5" onClick={onVerPerfil}>
        Ver perfil
      </Boton>
    </Card>
  );
};
