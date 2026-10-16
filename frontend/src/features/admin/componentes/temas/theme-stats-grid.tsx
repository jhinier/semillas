interface ThemeStatsGridProps {
  xpRecompensa: number;
  minutosEstimados: number;
  endaNombre: string | null;
  versionContenido: number;
}

export function ThemeStatsGrid({
  xpRecompensa,
  minutosEstimados,
  endaNombre,
  versionContenido,
}: ThemeStatsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
      <div className="bg-crema-fondo rounded-xl p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutro">XP</p>
        <p className="font-extrabold text-dorado-semilla mt-1">{xpRecompensa}</p>
      </div>
      <div className="bg-crema-fondo rounded-xl p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutro">Duración</p>
        <p className="font-extrabold text-neutro-oscuro-max mt-1">{minutosEstimados} min</p>
      </div>
      <div className="bg-crema-fondo rounded-xl p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutro">Senda</p>
        <p className="font-extrabold text-neutro-oscuro-max mt-1">{endaNombre ?? "—"}</p>
      </div>
      <div className="bg-crema-fondo rounded-xl p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutro">Versión</p>
        <p className="font-extrabold text-neutro-oscuro-max mt-1">v{versionContenido}</p>
      </div>
    </div>
  );
}
