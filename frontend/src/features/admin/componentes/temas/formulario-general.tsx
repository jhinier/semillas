import { FormField } from "@/componentes/ui/form-field";
import { Boton } from "@/componentes/ui/boton";
import { TagInput } from "./TagInput";

type FormularioGeneralProps = {
  title: string;
  onTitleChange: (v: string) => void;
  targetAudience: string;
  onTargetAudienceChange: (v: string) => void;
  shortDesc: string;
  onShortDescChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  keyVerse: string;
  onKeyVerseChange: (v: string) => void;
  duration: number;
  onDurationChange: (v: number) => void;
  mainMessage: string;
  onMainMessageChange: (v: string) => void;
  tagsList: string[];
  onTagsChange: (v: string[]) => void;
};

export function FormularioGeneral({
  title,
  onTitleChange,
  targetAudience,
  onTargetAudienceChange,
  shortDesc,
  onShortDescChange,
  category,
  onCategoryChange,
  keyVerse,
  onKeyVerseChange,
  duration,
  onDurationChange,
  mainMessage,
  onMainMessageChange,
  tagsList,
  onTagsChange,
}: FormularioGeneralProps) {
  return (
    <div className="p-6 flex flex-col gap-5 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Título del tema" requerido textoAyuda="El título es como se mostrará en la plataforma.">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:border-green-600 focus:outline-hidden focus:ring-2 focus:ring-green-600/10 transition-all"
          />
        </FormField>

        <FormField label="Público objetivo" requerido textoAyuda="Selecciona el grupo de edad principal.">
          <div className="relative">
            <select
              value={targetAudience}
              onChange={(e) => onTargetAudienceChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 appearance-none focus:border-green-600 focus:outline-hidden cursor-pointer"
            >
              <option value="Niños de 6 a 10 años">Niños de 6 a 10 años</option>
              <option value="Adolescentes de 11 a 15 años">Adolescentes de 11 a 15 años</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />
          </div>
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Descripción corta" requerido textoAyuda="Máximo 120 caracteres.">
          <textarea
            value={shortDesc}
            onChange={(e) => onShortDescChange(e.target.value)}
            maxLength={120}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-800 focus:border-green-600 focus:outline-hidden transition-all resize-none"
          />
        </FormField>

        <FormField label="Categoría" requerido textoAyuda="Selecciona la categoría principal del tema.">
          <div className="relative">
            <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 appearance-none focus:border-green-600 focus:outline-hidden cursor-pointer">
              <option value="confianza">Confianza en Dios</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none" />

            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-200 bg-violet-50 text-[11px] font-extrabold text-violet-600">
                {category}
                <Boton
                  variante="texto"
                  tamano="iconoPequeno"
                  onClick={() => onCategoryChange("")}
                  clase="hover:text-red-500"
                >
                  <i className="fa-solid fa-xmark text-[9px]" />
                </Boton>
              </span>
            </div>
          </div>
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Versículo clave" requerido textoAyuda="Versículo principal que memorizarán los niños.">
          <input
            type="text"
            value={keyVerse}
            onChange={(e) => onKeyVerseChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-800 focus:border-green-600 focus:outline-hidden transition-all"
          />
        </FormField>

        <FormField label="Duración estimada" requerido textoAyuda="Tiempo aproximado para completar el tema.">
          <div className="relative flex items-center">
            <input
              type="number"
              value={duration}
              onChange={(e) => onDurationChange(Number(e.target.value))}
              className="w-full pl-4 pr-16 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-800 focus:border-green-600 focus:outline-hidden transition-all"
            />
            <span className="absolute right-4 text-[11px] text-slate-400 font-bold">minutos</span>
          </div>
        </FormField>
      </div>

      <FormField label="Mensaje central" requerido textoAyuda="El mensaje principal que los niños deben recordar.">
        <textarea
          value={mainMessage}
          onChange={(e) => onMainMessageChange(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-800 focus:border-green-600 focus:outline-hidden transition-all resize-none"
        />
      </FormField>

      <TagInput tags={tagsList} onChange={onTagsChange} />
    </div>
  );
}
