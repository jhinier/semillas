import { Card } from "@/componentes/ui/card-base";
import { TarjetaMiembro } from "./tarjeta-miembro";

type MiembroRanking = {
  posicion: number;
  nombre: string;
  nivel: string;
  xpSemana: number;
  contribuciones?: number;
  avatarIndex: string;
};

type PropsTablaRanking = {
  miembros: MiembroRanking[];
  onVerCompleto?: () => void;
};

export function TablaRanking({ miembros, onVerCompleto }: PropsTablaRanking) {
  return (
    <Card sombra="sm" className="flex flex-col p-4 sm:p-6">
      <div className="mb-5 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-black text-slate-800">Ranking de miembros por XP total</h3>
        {onVerCompleto ? (
          <button
            type="button"
            onClick={onVerCompleto}
            className="min-h-11 rounded-xl bg-transparent px-2 text-xs font-bold text-violet-600 transition hover:bg-violet-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            Ver ranking completo
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="hidden grid-cols-12 border-b border-slate-100 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 sm:grid">
          <span className="col-span-2 text-center">Posición</span>
          <span className="col-span-4 text-left">Miembro</span>
          <span className="col-span-3 text-center">XP total</span>
          <span className="col-span-3 text-center">Contribuciones</span>
        </div>

        {miembros.length === 0 ? (
          <p className="py-5 text-center text-sm font-semibold text-slate-400">Todavía no hay miembros para mostrar.</p>
        ) : null}

        {miembros.map((miembro) => (
          <TarjetaMiembro
            key={miembro.posicion}
            posicion={miembro.posicion}
            nombre={miembro.nombre}
            nivel={miembro.nivel}
            xpSemana={miembro.xpSemana}
            contribuciones={miembro.contribuciones}
            avatarIndex={miembro.avatarIndex}
          />
        ))}
      </div>
    </Card>
  );
}

export type { MiembroRanking };
