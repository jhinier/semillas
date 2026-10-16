import { Boton } from "@/componentes/ui/boton";
import { ThemePreviewCard } from "./ThemePreviewCard";

type VistaPreviaRapidaProps = {
  title: string;
  category: string;
  targetAudience: string;
  shortDesc: string;
  mainMessage: string;
  keyVerse: string;
  duration: number;
  previewImageUrl?: string | null;
};

export function VistaPreviaRapida({
  title,
  category,
  targetAudience,
  shortDesc,
  mainMessage,
  keyVerse,
  duration,
  previewImageUrl,
}: VistaPreviaRapidaProps) {
  return (
    <div className="p-6 flex flex-col gap-4 text-left">
      <div className="flex justify-between items-center select-none">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm md:text-base">Vista previa rápida</h3>
          <p className="text-[12px] text-slate-400 mt-1 font-medium">Así se verá tu tema para los niños.</p>
        </div>

        <Boton variante="texto" tamano="pequeno" forma="pildora" iconoIzquierdo={<i className="fa-solid fa-eye text-[11px]" />}>
          Ver vista previa
        </Boton>
      </div>

      <ThemePreviewCard
        title={title}
        category={category}
        targetAudience={targetAudience}
        shortDesc={shortDesc}
        mainMessage={mainMessage}
        keyVerse={keyVerse}
        duration={duration}
        previewImageUrl={previewImageUrl}
      />
    </div>
  );
}
