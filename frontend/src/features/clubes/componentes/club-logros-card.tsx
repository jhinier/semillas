import * as React from "react";
import { Shield, Flame, Heart } from "lucide-react";
import { Card } from "@/componentes/ui/card-base";
import { Boton } from "@/componentes/ui/boton";

export interface ClubLogro {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipoIcono: "shield" | "flame" | "heart";
  completado: boolean;
  progresoActual?: number;
  progresoMeta?: number;
}

export interface ClubLogrosCardProps {
  logros: ClubLogro[];
  onVerTodos?: () => void;
}

const BAR_COLORS = {
  shield: "bg-blue-500",
  flame: "bg-orange-500",
  heart: "bg-blue-500",
} as const;

const ICONOS_LOGRO = {
  shield: { icono: <Shield size={18} />, clase: "bg-violet-100 text-violet-600" },
  flame: { icono: <Flame size={18} />, clase: "bg-orange-50 text-orange-500" },
  heart: { icono: <Heart size={18} />, clase: "bg-blue-50 text-blue-500" },
} as const;

export const ClubLogrosCard: React.FC<ClubLogrosCardProps> = ({ logros, onVerTodos }) => {
  return (
    <Card sombra="sm" className="p-6 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-black text-slate-800">Logros del club</h3>
        {onVerTodos && (
          <Boton
            variante="texto"
            tamano="pequeno"
            onClick={onVerTodos}
            className="!text-violet-600 hover:!underline"
          >
            Ver todos
          </Boton>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {logros.map((logro) => {
          const showBar = !logro.completado && logro.progresoActual !== undefined && logro.progresoMeta !== undefined;
          const porcentaje = showBar ? Math.round((logro.progresoActual! / logro.progresoMeta!) * 100) : 0;

          return (
            <div
              key={logro.id}
              className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3.5 flex items-center gap-3 text-left"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${ICONOS_LOGRO[logro.tipoIcono].clase}`}>
                {ICONOS_LOGRO[logro.tipoIcono].icono}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-extrabold text-slate-800 leading-tight mb-0.5">{logro.nombre}</h4>
                <p className="text-[10px] text-slate-400">{logro.descripcion}</p>
                {showBar && (
                  <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full ${BAR_COLORS[logro.tipoIcono]}`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                )}
              </div>

              {logro.completado ? (
                <span className="bg-green-50 text-green-700 border border-green-100 rounded-md text-[9px] font-extrabold uppercase px-2 py-0.5 flex-shrink-0">
                  ✓ Completado
                </span>
              ) : (
                <span className="text-[10px] font-black text-slate-600 flex-shrink-0">
                  {logro.progresoActual} / {logro.progresoMeta}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
