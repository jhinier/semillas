import type { ReactNode } from "react";
import { Eye, BookOpenText, Sparkles, Clock3 } from "lucide-react";

interface ThemeSummary {
  titulo?: string | null;
  estado?: string | null;
  version_contenido?: number | null;
  xp_recompensa?: number | null;
  minutos_estimados?: number | null;
  actualizado_en?: string | null;
  portada_recurso?: { url_publica?: string | null } | null;
}

interface ActiveStepContent {
  titulo?: string | null;
  cuerpo?: string | null;
  instruccion_corta?: string | null;
}

interface ThemeCrecerSidebarProps {
  theme?: ThemeSummary | null;
  portadaUrl: string | null;
  estado: { etiqueta: string };
  activeStepContent: ActiveStepContent | null;
  formatElapsed: (dateStr?: string | null) => string;
}

export function ThemeCrecerSidebar({
  theme,
  portadaUrl,
  estado,
  activeStepContent,
  formatElapsed,
}: ThemeCrecerSidebarProps) {
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
      <section className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-[#fdfbf4] to-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Resumen del tema</p>
          <h3 className="mt-2 text-lg font-black text-slate-800">{theme?.titulo ?? "Sin título"}</h3>
        </div>

        <div className="p-5">
          <div className="grid gap-3">
            <SidebarMetric label="Estado" value={estado.etiqueta} />
            <SidebarMetric label="Versión" value={`v${theme?.version_contenido ?? 0}`} />
            <SidebarMetric label="XP" value={`${theme?.xp_recompensa ?? 0}`} />
            <SidebarMetric label="Duración" value={`${theme?.minutos_estimados ?? 0} min`} />
          </div>

          <div className="mt-4 rounded-2xl bg-[#f7f4ec] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Portada</p>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100 bg-white">
              {portadaUrl ? (
                <img src={portadaUrl} alt={`Portada de ${theme?.titulo ?? "tema"}`} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center text-slate-300">
                  <Eye size={24} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <BookOpenText size={16} />
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]">Contenido actual</p>
        </div>

        {activeStepContent ? (
          <div className="mt-4 space-y-3 rounded-2xl bg-[#fcfcfb] p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#2e9e5b]">{activeStepContent.titulo}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{activeStepContent.cuerpo}</p>
            </div>
            {activeStepContent.instruccion_corta ? (
              <p className="rounded-2xl bg-[#eefcf4] px-3 py-2 text-xs font-semibold leading-6 text-[#2e9e5b]">
                {activeStepContent.instruccion_corta}
              </p>
            ) : null}
          </div>
        ) : (
          <EmptyPreviewBlock
            title="Sin contenido guardado"
            description="Cuando selecciones una franja y un paso, aquí verás la versión guardada del bloque actual."
          />
        )}
      </section>

      <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <Sparkles size={16} />
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]">Guía rápida</p>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
          <GuideItem text="Edita una franja a la vez para no mezclar mensajes." />
          <GuideItem text="Mantén títulos cortos y contenido directo, pensado para lectura móvil." />
          <GuideItem text="Guarda cada paso antes de cambiar de franja o de momento CRECER." />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <Clock3 size={16} />
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]">Última edición</p>
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-700">
          {formatElapsed(theme?.actualizado_en)}
        </p>
      </section>
    </aside>
  );
}

function SidebarMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</span>
      <span className="text-sm font-extrabold text-slate-800">{value}</span>
    </div>
  );
}

function EmptyPreviewBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
      <p className="text-sm font-black text-slate-700">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
    </div>
  );
}

function GuideItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl bg-slate-50 p-3">
      <span className="mt-1 h-2 w-2 rounded-full bg-[#2e9e5b]" />
      <p>{text}</p>
    </div>
  );
}
