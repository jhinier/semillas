import { Zap } from "lucide-react";
import { AvatarTexto } from "@/componentes/ui/avatar-texto";
import { resolverAvatar } from "@/shared/constants/avatares";

type PropsTarjetaMiembro = {
  posicion: number;
  nombre: string;
  nivel: string;
  xpSemana: number;
  contribuciones?: number;
  avatarIndex: string;
};

const COLORES_POSICION: Record<number, string> = {
  1: "bg-amber-100 text-amber-700",
  2: "bg-slate-100 text-slate-700",
  3: "bg-orange-100 text-orange-700",
};

function obtenerColorPosicion(posicion: number): string {
  return COLORES_POSICION[posicion] ?? "bg-slate-50 text-slate-500";
}

export function TarjetaMiembro({
  posicion,
  nombre,
  nivel,
  xpSemana,
  contribuciones,
  avatarIndex,
}: PropsTarjetaMiembro) {
  const avatarUrl = resolverAvatar(avatarIndex);

  return (
    <div className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-2xl border border-slate-100 bg-white p-3 sm:grid-cols-12 sm:gap-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-1">
      <div className="flex justify-center sm:col-span-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${obtenerColorPosicion(posicion)}`}>
          {posicion}
        </span>
      </div>
      <div className="min-w-0 text-left sm:col-span-4">
        <AvatarTexto
          src={avatarUrl}
          alt={nombre}
          titulo={nombre}
          subtitulo={nivel}
          className="gap-2.5"
          avatarClassName="h-9 w-9 rounded-full border border-slate-100 bg-orange-100"
          tituloClassName="truncate text-xs font-extrabold text-slate-800"
          subtituloClassName="truncate text-[9px] font-semibold text-slate-400"
        />
      </div>
      <div className="flex items-center justify-end gap-1 whitespace-nowrap sm:col-span-3 sm:justify-center">
        <Zap size={12} className="fill-amber-500 text-amber-500" aria-hidden="true" />
        <span className="text-xs font-black text-slate-700">{xpSemana} XP</span>
      </div>
      <span className="col-span-2 col-start-2 text-left text-[10px] font-semibold text-slate-500 sm:col-span-3 sm:col-start-auto sm:text-center sm:text-xs">
        {contribuciones === undefined ? "Sin contribuciones registradas" : `${contribuciones} actividades`}
      </span>
    </div>
  );
}
