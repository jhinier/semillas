import { Clock, List, Sparkles } from "lucide-react";
import { unirClases } from "@/lib/utilidades";

interface TemaMetadatosProps {
  duracion?: string;
  xp?: number;
}

export function TemaMetadatos({ duracion, xp }: TemaMetadatosProps) {
  if (!duracion && !xp) return null;

  return (
    <div className="theme-card__metadata flex flex-wrap items-center gap-2 text-[11px] font-black text-slate-500">
      {duracion && (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1">
          <Clock className="size-3.5" />
          {duracion}
        </span>
      )}
      {xp && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
          <Sparkles className="size-3.5" />
          {xp} XP
        </span>
      )}
    </div>
  );
}

interface TemaSendaEtiquetaProps {
  claseSenda: string;
  senda: string;
}

export function TemaSendaEtiqueta({ claseSenda, senda }: TemaSendaEtiquetaProps) {
  return (
    <span
      className={unirClases(
        "theme-card__senda-label inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]",
        claseSenda,
      )}
    >
      <List className="size-3.5" />
      {senda}
    </span>
  );
}

interface TemaTituloDescripcionProps {
  titulo: string;
  descripcion: string;
  esCompacta: boolean;
}

export function TemaTituloDescripcion({ titulo, descripcion, esCompacta }: TemaTituloDescripcionProps) {
  return (
    <>
      <h3
        className={unirClases(
          "theme-card__title line-clamp-2 font-black tracking-[-0.035em] text-slate-900",
          esCompacta ? "text-[1.35rem] leading-[1.1]" : "text-[1.55rem] leading-[1.08] md:text-[1.65rem]",
        )}
      >
        {titulo}
      </h3>

      <p className={unirClases("theme-card__description line-clamp-2 font-semibold leading-relaxed text-slate-500", esCompacta ? "min-h-[32px] text-[12px]" : "min-h-[38px] text-[13px]")}>
        {descripcion}
      </p>
    </>
  );
}
