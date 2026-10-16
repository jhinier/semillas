import { Sparkles } from "lucide-react";

type ActividadHeaderProps = {
  titulo: string;
  descripcion: string;
  xp?: number;
};

export function ActividadHeader({ titulo, descripcion, xp }: ActividadHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="mb-1 inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#2E9E5B]">
          <Sparkles className="size-3" aria-hidden="true" /> Actividad
        </p>
        <h2 className="text-2xl font-black leading-tight text-[#123B2C]">{titulo}</h2>
        <p className="mt-1 text-sm font-semibold leading-6 text-[#49695D]">{descripcion}</p>
      </div>

      {typeof xp === "number" && (
        <span className="shrink-0 rounded-2xl bg-[#F4B740] px-3 py-2 text-sm font-black text-[#123B2C] shadow-sm">
          {xp} XP
        </span>
      )}
    </header>
  );
}
