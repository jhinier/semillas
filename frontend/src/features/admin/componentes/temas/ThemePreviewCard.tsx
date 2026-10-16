import { Boton } from "@/componentes/ui/boton";
import imgBoySheep from "@/assets/images/Ilustraciones/in2.webp";

type ThemePreviewCardProps = {
  title: string;
  category: string;
  targetAudience: string;
  shortDesc: string;
  mainMessage: string;
  keyVerse: string;
  duration: number;
  previewImageUrl?: string | null;
};

export function ThemePreviewCard({
  title,
  category,
  targetAudience,
  shortDesc,
  mainMessage,
  keyVerse,
  duration,
  previewImageUrl,
}: ThemePreviewCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100/70 p-4 bg-green-50/50 flex flex-col sm:flex-row items-center gap-5">
      <div className="w-44 h-28 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-100 relative shadow-xs">
        <img src={previewImageUrl ?? imgBoySheep} alt={title || "Vista previa del tema"} className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col gap-2 min-w-0 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-violet-600">
            {category || "confianza"}
          </span>
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-green-600">
            {targetAudience}
          </span>
        </div>
        <h4 className="font-black text-slate-800 text-base md:text-lg leading-tight truncate">{title || "Dios me cuida"}</h4>
        <p className="text-[11.5px] font-semibold text-slate-500 leading-relaxed line-clamp-2">
          {shortDesc || "Descubrimos cómo Dios cuida de nosotros cada día con amor y detalle."}
        </p>
        <p className="text-[10.5px] font-bold leading-relaxed text-slate-400 line-clamp-2">
          {mainMessage || "Mensaje central del tema."}
        </p>
        <div className="flex items-center gap-3.5 mt-1 text-[10.5px] text-slate-400 font-bold">
          <div className="flex items-center gap-1">
            <i className="fa-solid fa-bookmark text-violet-600" />
            <span className="text-violet-600">{keyVerse}</span>
          </div>
          <div className="flex items-center gap-1">
            <i className="fa-solid fa-user-group" />
            <span>{targetAudience}</span>
          </div>
          <div className="flex items-center gap-1">
            <i className="fa-solid fa-clock" />
            <span>{duration} minutos</span>
          </div>
        </div>
      </div>
    </div>
  );
}

type PreviewSectionProps = {
  title: string;
  category: string;
  targetAudience: string;
  shortDesc: string;
  mainMessage: string;
  keyVerse: string;
  duration: number;
  previewImageUrl?: string | null;
};

export function PreviewSection({
  title,
  category,
  targetAudience,
  shortDesc,
  mainMessage,
  keyVerse,
  duration,
  previewImageUrl,
}: PreviewSectionProps) {
  return (
    <div className="flex justify-between items-center select-none">
      <div>
        <h3 className="font-extrabold text-slate-800 text-sm md:text-base">Vista previa rápida</h3>
        <p className="text-[12px] text-slate-400 mt-1 font-medium">Así se verá tu tema para los niños.</p>
      </div>

      <Boton variante="texto" tamano="pequeno" forma="pildora" iconoIzquierdo={<i className="fa-solid fa-eye text-[11px]" />}>
        Ver vista previa
      </Boton>
    </div>
  );
}
