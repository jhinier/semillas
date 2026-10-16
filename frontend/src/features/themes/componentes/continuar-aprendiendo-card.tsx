import { BookOpen, Play, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/componentes/ui/card-base";
import { Boton } from "@/componentes/ui/boton";
import type { TemaUI } from "@/features/themes/types";

export type { TemaUI };

export interface ContinuarAprendiendoCardProps {
  tema: TemaUI | null;
  onContinuar: () => void;
  modo?: "continuar" | "recomendado";
}

export function ContinuarAprendiendoCard({
  tema,
  onContinuar,
  modo = "continuar",
}: ContinuarAprendiendoCardProps) {
  if (!tema) return null;

  const esContinuacion = modo === "continuar";

  return (
    <Card
      sombra="sm"
      hoverEffect="none"
      clase="flex flex-col gap-5 rounded-[24px] border border-slate-100 p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-500">
            {esContinuacion ? "Sigue avanzando" : "Empieza por aquí"}
          </span>
          <h3 className="mt-1 text-lg font-extrabold text-slate-800">
            {esContinuacion ? "Continuar aprendiendo" : "Tu primera lección"}
          </h3>
        </div>
        {esContinuacion ? (
          <TrendingUp className="size-6 shrink-0 text-emerald-500" />
        ) : (
          <Sparkles className="size-6 shrink-0 text-amber-500" />
        )}
      </div>

      <div className="flex gap-3.5 items-center">
        <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
          {tema.imagenUrl ? (
            <img src={tema.imagenUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <BookOpen className="size-6 text-primario" />
          )}
        </div>
        <div className="min-w-0 text-left">
          <h4 className="line-clamp-2 text-base font-bold leading-tight text-slate-800">
            {tema.titulo}
          </h4>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {esContinuacion ? `${tema.progreso}% completado` : `${tema.duracion} • ${tema.xp} XP`}
          </p>
        </div>
      </div>

      <p className="text-left text-[13px] font-medium leading-normal text-slate-500">
        {esContinuacion
          ? "Retoma el tema donde lo dejaste y continúa sumando progreso."
          : "Una buena forma de comenzar tu recorrido por las Sendas."}
      </p>

      <Boton
        variante="contorno"
        className="w-full cursor-pointer rounded-xl border-primario bg-white py-2.5 text-sm font-bold text-primario transition-all hover:bg-primario/5"
        iconoIzquierdo={<Play className="size-4 fill-primario text-primario" />}
        onClick={onContinuar}
      >
        {esContinuacion ? "Continuar tema" : "Empezar tema"}
      </Boton>
    </Card>
  );
}
