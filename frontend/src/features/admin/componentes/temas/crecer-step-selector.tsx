import type { CSSProperties } from "react";
import { BookOpenText, Check, Circle, PencilLine } from "lucide-react";

interface CrecerStep {
  id: string;
  codigo: string;
  nombre: string;
  color_hex?: string | null;
}

interface StepContent {
  tipo_paso?: { codigo: string } | null;
  contenidos?: Array<{
    grupo_edad_id: string;
    titulo?: string | null;
    cuerpo?: string | null;
  }> | null;
}

interface CrecerStepSelectorProps {
  pasos: CrecerStep[];
  activeStepCode: string;
  selectedAgeGroupId: string;
  stepsData?: StepContent[] | null;
  onSelect: (codigo: string) => void;
  hasDraft?: (codigo: string) => boolean;
  stepNumber?: number;
}

const MOMENTO_GUIA_FACIL: Record<string, { orden: number; explicacion: string }> = {
  conectar: { orden: 1, explicacion: "Pregunta o juego para despertar interés" },
  relatar: { orden: 2, explicacion: "Cuenta la historia bíblica con palabras sencillas" },
  ensenar: { orden: 3, explicacion: "Explica qué nos enseña Dios hoy" },
  comprobar: { orden: 4, explicacion: "Preguntas para ver si comprendieron" },
  experimentar: { orden: 5, explicacion: "Reto práctico para hacer en la semana" },
  recompensar: { orden: 6, explicacion: "Celebra lo aprendido y cierra con oración" },
};

export function CrecerStepSelector({
  pasos,
  activeStepCode,
  selectedAgeGroupId,
  stepsData,
  onSelect,
  hasDraft,
  stepNumber = 2,
}: CrecerStepSelectorProps) {
  return (
    <section className="admin-crecer-control">
      <div className="admin-crecer-control__heading">
        <div className="admin-crecer-control__icon" aria-hidden="true">
          <BookOpenText size={18} />
        </div>
        <div>
          <h2>{stepNumber}. Elige el momento (del 1 al 6)</h2>
          <p>Avanza en orden del 1 al 6 para completar la lección.</p>
        </div>
      </div>

      <div className="admin-crecer-step-options">
        {pasos.map((step) => {
          const isActive = activeStepCode === step.codigo;
          const hasLocalDraft = hasDraft?.(step.codigo) ?? false;
          const guia = MOMENTO_GUIA_FACIL[step.codigo];
          const completed = selectedAgeGroupId
            ? stepsData?.some(
                (record) =>
                  record.tipo_paso?.codigo === step.codigo &&
                  record.contenidos?.some(
                    (content) =>
                      content.grupo_edad_id === selectedAgeGroupId &&
                      Boolean(content.titulo?.trim()) &&
                      Boolean(content.cuerpo?.trim()) &&
                      content.cuerpo !== "Contenido pendiente...",
                  ),
              )
            : false;
          const style = {
            "--step-color": step.color_hex ?? "#2e9e5b",
          } as CSSProperties;

          return (
            <button
              key={step.codigo}
              type="button"
              onClick={() => onSelect(step.codigo)}
              className={`admin-crecer-step-option ${isActive ? "admin-crecer-step-option--active" : ""} ${completed ? "admin-crecer-step-option--complete" : ""}`}
              style={style}
              aria-pressed={isActive}
              title={hasLocalDraft ? `${step.nombre}: borrador sin guardar` : guia?.explicacion ?? step.nombre}
            >
              <span className="admin-crecer-step-option__status" aria-hidden="true">
                {hasLocalDraft ? (
                  <PencilLine size={14} className={isActive ? undefined : "text-amber-600"} />
                ) : completed ? (
                  <Check size={15} />
                ) : (
                  <Circle size={14} />
                )}
              </span>
              <span className="admin-crecer-step-option__copy">
                <strong>{guia ? `${guia.orden}. ${step.nombre}` : step.nombre}</strong>
                <small>
                  {hasLocalDraft
                    ? "Borrador sin guardar"
                    : completed
                      ? "Listo y guardado"
                      : isActive
                        ? `Editando · ${guia?.explicacion ?? "Completa abajo"}`
                        : (guia?.explicacion ?? "Pendiente")}
                </small>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
