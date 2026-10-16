const STEPS = [
  "Información general",
  "Escritura",
  "CRECER",
  "Actividades",
  "Media",
  "Preview",
] as const;

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div
      className="w-full overflow-x-auto pb-2 [scrollbar-width:thin]"
      aria-label={`Paso ${currentStep + 1} de ${STEPS.length}`}
    >
      <div className="flex min-w-max items-center gap-2" role="list">
        {STEPS.map((step, idx) => {
          const isActiveOrDone = idx <= currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={step} className="flex items-center gap-2" role="listitem">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isActiveOrDone
                    ? "bg-verde-brote text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {idx + 1}
              </div>
              <span
                className={`max-w-32 text-xs font-semibold ${
                  isActiveOrDone ? "text-slate-700" : "text-slate-400"
                }`}
              >
                {step}
              </span>
              {idx < STEPS.length - 1 ? (
                <div className="h-px w-5 shrink-0 bg-slate-200 sm:w-8" aria-hidden="true" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
