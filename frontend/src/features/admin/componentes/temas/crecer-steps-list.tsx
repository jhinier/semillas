import { BookOpenText, Layers3 } from "lucide-react";
import { SectionCard, EmptyState } from "./section-card";

interface StepContent {
  id: string;
  orden: number;
  tipo_paso?: {
    id?: string;
    codigo?: string;
    nombre?: string | null;
    color_hex?: string | null;
  } | null;
  contenidos: Array<{
    id: string;
    grupo_edad_id: string;
    titulo?: string | null;
    cuerpo?: string | null;
    instruccion_corta?: string | null;
  }>;
}

interface CrecerStepsListProps {
  pasos: StepContent[];
}

export function CrecerStepsList({ pasos }: CrecerStepsListProps) {
  return (
    <SectionCard
      icon={Layers3}
      title="Recorrido CRECER"
      description="La secuencia pedagógica del tema en el editor."
    >
      {pasos.length === 0 ? (
        <EmptyState
          icon={BookOpenText}
          title="Sin pasos CRECER aún"
          description="Agrega pasos para que el tema tenga estructura pedagógica visible."
        />
      ) : (
        <div className="grid gap-4">
          {pasos.map((step) => (
            <article key={step.id} className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-sm">
              <div className="flex items-start gap-4 border-b border-slate-100 bg-[#faf8f2] p-5">
                <span
                  className="mt-1 h-11 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: step.tipo_paso?.color_hex ?? "#cbd5e1" }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-slate-800">
                      {step.tipo_paso?.nombre ?? "Paso sin nombre"}
                    </h3>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Orden {step.orden}
                    </span>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    {step.contenidos.length
                      ? `${step.contenidos.length} bloque(s) de contenido disponibles para este paso.`
                      : "No hay contenidos cargados en este paso."}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 p-5 md:grid-cols-2">
                {step.contenidos.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 md:col-span-2">
                    Aún no se configuró contenido para este paso.
                  </div>
                ) : (
                  step.contenidos.map((content) => (
                    <article key={content.id} className="rounded-2xl border border-slate-100 bg-[#fcfcfb] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                        {content.grupo_edad_id}
                      </p>
                      <h4 className="mt-2 text-sm font-extrabold text-slate-800">
                        {content.titulo}
                      </h4>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                        {content.cuerpo}
                      </p>
                      {content.instruccion_corta ? (
                        <p className="mt-3 rounded-2xl bg-[#eefcf4] px-3 py-2 text-xs font-semibold leading-6 text-[#2e9e5b]">
                          {content.instruccion_corta}
                        </p>
                      ) : null}
                    </article>
                  ))
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
