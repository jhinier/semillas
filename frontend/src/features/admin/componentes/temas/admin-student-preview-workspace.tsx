import type { CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  Clock3,
  Edit3,
  Eye,
  FileQuestion,
  Gamepad2,
  Image as ImageIcon,
  Layers3,
  Play,
  Sparkles,
} from "lucide-react";

import { FASES_CRECER } from "@/features/crecer/crecer-fases";
import type { ActividadAdmin } from "@/features/admin/admin.api";
import type { ThemePreviewMode } from "../../hooks/use-theme-preview-page";

type AgeGroup = {
  id: string;
  nombre?: string | null;
};

type StepContent = {
  id?: string;
  grupo_edad_id: string;
  titulo?: string | null;
  cuerpo?: string | null;
  instruccion_corta?: string | null;
};

type ReflectionQuestion = {
  id?: string;
  grupo_edad_id: string;
  pregunta: string;
  orden: number;
};

type PreviewStep = {
  id: string;
  orden: number;
  tipo_paso?: {
    codigo?: string | null;
    nombre?: string | null;
    color_hex?: string | null;
  } | null;
  contenidos?: StepContent[];
  preguntas?: ReflectionQuestion[];
};

type PreviewTheme = {
  id: string;
  titulo: string;
  resumen?: string | null;
  objetivo?: string | null;
  minutos_estimados?: number | null;
  xp_recompensa?: number | null;
  senda?: {
    nombre?: string | null;
    color_hex?: string | null;
  } | null;
  portada_recurso?: {
    texto_alternativo?: string | null;
  } | null;
};

type Props = {
  theme: PreviewTheme;
  portadaUrl: string | null;
  estado: {
    clase: string;
    punto: string;
    etiqueta: string;
  };
  previewMode: ThemePreviewMode;
  onPreviewModeChange: (mode: ThemePreviewMode) => void;
  ageGroups: AgeGroup[];
  selectedAgeGroup: AgeGroup | null;
  selectedAgeGroupId: string;
  onAgeGroupChange: (id: string) => void;
  steps: PreviewStep[];
  activeStepCode: string;
  onStepChange: (code: string) => void;
  selectedStep: PreviewStep | null;
  selectedContent: StepContent | null;
  selectedQuestions: ReflectionQuestion[];
  ageActivities: ActividadAdmin[];
  selectedStepActivities: ActividadAdmin[];
  completedStepCodes: Set<string>;
  onBack: () => void;
  onEditTheme: () => void;
  onEditCrecer: () => void;
  onEditActivities: () => void;
};

export function AdminStudentPreviewWorkspace({
  theme,
  portadaUrl,
  estado,
  previewMode,
  onPreviewModeChange,
  ageGroups,
  selectedAgeGroup,
  selectedAgeGroupId,
  onAgeGroupChange,
  steps,
  activeStepCode,
  onStepChange,
  selectedStep,
  selectedContent,
  selectedQuestions,
  ageActivities,
  selectedStepActivities,
  completedStepCodes,
  onBack,
  onEditTheme,
  onEditCrecer,
  onEditActivities,
}: Props) {
  return (
    <div className="admin-student-preview">
      <header className="admin-student-preview__toolbar">
        <div className="admin-student-preview__toolbar-main">
          <button
            type="button"
            className="admin-icon-button admin-student-preview__back"
            onClick={onBack}
            aria-label="Volver a temas"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="admin-student-preview__heading">
            <div className="admin-student-preview__title-row">
              <span className="admin-eyebrow">Vista del estudiante</span>
              <span className={`admin-student-preview__status ${estado.clase}`}>
                <span className={estado.punto} />
                {estado.etiqueta}
              </span>
            </div>
            <h1>{theme.titulo || "Tema sin título"}</h1>
            <p>Comprueba la portada y cada momento CRECER sin salir del panel editorial.</p>
          </div>

          <div className="admin-student-preview__actions">
            <button type="button" className="admin-secondary-button" onClick={onEditTheme}>
              <Edit3 size={16} />
              Editar tema
            </button>
            <button
              type="button"
              className="admin-primary-button"
              onClick={() => {
                if (previewMode === "lesson") onEditCrecer();
                else onPreviewModeChange("lesson");
              }}
            >
              {previewMode === "lesson" ? <Layers3 size={16} /> : <Eye size={16} />}
              {previewMode === "lesson" ? "Editar CRECER" : "Ver la lección"}
            </button>
          </div>
        </div>

        <div className="admin-student-preview__controls">
          <div className="admin-student-preview__mode" role="group" aria-label="Tipo de vista previa">
            <button
              type="button"
              className={previewMode === "overview" ? "is-active" : ""}
              aria-pressed={previewMode === "overview"}
              onClick={() => onPreviewModeChange("overview")}
            >
              <BookOpenCheck size={15} />
              Portada del tema
            </button>
            <button
              type="button"
              className={previewMode === "lesson" ? "is-active" : ""}
              aria-pressed={previewMode === "lesson"}
              onClick={() => onPreviewModeChange("lesson")}
            >
              <Play size={15} />
              Lección CRECER
            </button>
          </div>

          <div className="admin-student-preview__age" role="group" aria-label="Franja de edad simulada">
            <span>Simular para</span>
            <div>
              {ageGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  className={group.id === selectedAgeGroupId ? "is-active" : ""}
                  aria-pressed={group.id === selectedAgeGroupId}
                  onClick={() => onAgeGroupChange(group.id)}
                >
                  {group.nombre ?? "Franja"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="admin-student-preview__notice" role="note">
        <Eye size={16} />
        <span>
          Modo simulación para <strong>{selectedAgeGroup?.nombre ?? "la franja seleccionada"}</strong>.
          Las acciones del estudiante están desactivadas.
        </span>
      </div>

      <section className="admin-student-preview__frame" aria-label="Simulación de la experiencia del estudiante">
        <div className="admin-student-preview__framebar" aria-hidden="true">
          <span />
          <span />
          <span />
          <strong>Semillas · vista del estudiante</strong>
        </div>

        <div className="admin-student-preview__viewport">
          {previewMode === "overview" ? (
            <ThemeOverviewPreview
              theme={theme}
              portadaUrl={portadaUrl}
              steps={steps}
              completedStepCodes={completedStepCodes}
            />
          ) : (
            <LessonPreview
              theme={theme}
              steps={steps}
              activeStepCode={activeStepCode}
              onStepChange={onStepChange}
              selectedStep={selectedStep}
              selectedContent={selectedContent}
              selectedQuestions={selectedQuestions}
              activities={selectedStepActivities}
              onEditCrecer={onEditCrecer}
              onEditActivities={onEditActivities}
            />
          )}
        </div>
      </section>

      <footer className="admin-student-preview__summary">
        <div>
          <span>Franja simulada</span>
          <strong>{selectedAgeGroup?.nombre ?? "Sin franja"}</strong>
        </div>
        <div>
          <span>Contenido CRECER</span>
          <strong>{completedStepCodes.size}/{steps.length || 6} pasos</strong>
        </div>
        <div>
          <span>Actividades disponibles</span>
          <strong>{ageActivities.length}</strong>
        </div>
        <button type="button" className="admin-secondary-button" onClick={onEditActivities}>
          <Gamepad2 size={16} />
          Gestionar actividades
        </button>
      </footer>
    </div>
  );
}

function ThemeOverviewPreview({
  theme,
  portadaUrl,
  steps,
  completedStepCodes,
}: {
  theme: PreviewTheme;
  portadaUrl: string | null;
  steps: PreviewStep[];
  completedStepCodes: Set<string>;
}) {
  return (
    <div className="theme-detail admin-student-preview__theme-detail">
      <div className="theme-detail__back admin-student-preview__disabled-control" aria-hidden="true">
        <ArrowLeft />
        Mis temas
      </div>

      <section className="theme-detail__hero">
        <div className="theme-detail__media">
          {portadaUrl ? (
            <img
              src={portadaUrl}
              alt={theme.portada_recurso?.texto_alternativo || `Portada de ${theme.titulo}`}
            />
          ) : (
            <div className="theme-detail__media-empty">
              <ImageIcon aria-hidden="true" />
              <span>Portada no disponible</span>
            </div>
          )}
        </div>

        <div className="theme-detail__intro">
          <span
            className="theme-detail__senda"
            style={{
              color: theme.senda?.color_hex || "#2563eb",
              backgroundColor: `${theme.senda?.color_hex || "#2563eb"}12`,
            }}
          >
            <span style={{ backgroundColor: theme.senda?.color_hex || "#2563eb" }} />
            {theme.senda?.nombre || "Senda"}
          </span>

          <h1>{theme.titulo || "Tema"}</h1>
          <p className="theme-detail__summary">
            {theme.resumen || theme.objetivo || "Descubre una nueva enseñanza de la Palabra de Dios."}
          </p>

          <div className="theme-detail__stats">
            <span><Sparkles /> {theme.xp_recompensa ?? 0} XP</span>
            <span><Clock3 /> {theme.minutos_estimados ?? 10} min</span>
            <span><BookOpenCheck /> {steps.length || 6} pasos</span>
          </div>

          <div className="theme-detail__progress-card">
            <div>
              <strong>Tu progreso</strong>
              <span>0%</span>
            </div>
            <div className="theme-detail__progress-track" aria-label="0% completado">
              <span style={{ width: "0%" }} />
            </div>
            <small>Comienza con Conectar y avanza a tu ritmo.</small>
          </div>

          <div className="theme-detail__actions">
            <button type="button" className="theme-detail__primary admin-student-preview__disabled-control">
              <Play fill="currentColor" />
              Comenzar lección
              <ArrowRight />
            </button>
          </div>
        </div>
      </section>

      <section className="theme-detail__journey" aria-labelledby="admin-preview-journey-title">
        <div className="theme-detail__section-heading">
          <div>
            <span>METODOLOGÍA CRECER</span>
            <h2 id="admin-preview-journey-title">Tu recorrido en seis pasos</h2>
          </div>
          <p>Lee, participa y aplica cada enseñanza antes de recibir tu recompensa.</p>
        </div>

        <ol className="theme-detail__steps">
          {FASES_CRECER.map((phase) => {
            const available = completedStepCodes.has(phase.codigo ?? "");
            return (
              <li key={phase.numero} className={available ? "is-complete" : ""}>
                <span className="theme-detail__step-number">
                  {available ? <Check aria-hidden="true" /> : phase.numero}
                </span>
                <div>
                  <strong>{phase.nombre}</strong>
                  <p>{phase.descripcion}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function LessonPreview({
  theme,
  steps,
  activeStepCode,
  onStepChange,
  selectedStep,
  selectedContent,
  selectedQuestions,
  activities,
  onEditCrecer,
  onEditActivities,
}: {
  theme: PreviewTheme;
  steps: PreviewStep[];
  activeStepCode: string;
  onStepChange: (code: string) => void;
  selectedStep: PreviewStep | null;
  selectedContent: StepContent | null;
  selectedQuestions: ReflectionQuestion[];
  activities: ActividadAdmin[];
  onEditCrecer: () => void;
  onEditActivities: () => void;
}) {
  const phase = FASES_CRECER.find((item) => item.codigo === activeStepCode) ?? FASES_CRECER[0]!;
  const phaseIndex = Math.max(0, FASES_CRECER.findIndex((item) => item.codigo === phase.codigo));
  const style = {
    "--preview-phase": phase.colorAccent,
    "--preview-phase-soft": phase.colorSuave ?? "#eef6ef",
  } as CSSProperties;

  return (
    <div className="admin-student-lesson" style={style}>
      <nav className="admin-student-lesson__steps" aria-label="Momentos CRECER">
        {FASES_CRECER.map((item) => {
          const exists = steps.some((step) => step.tipo_paso?.codigo === item.codigo);
          return (
            <button
              key={item.numero}
              type="button"
              className={item.codigo === activeStepCode ? "is-active" : ""}
              aria-current={item.codigo === activeStepCode ? "step" : undefined}
              onClick={() => onStepChange(item.codigo ?? "conectar")}
            >
              <span>{item.numero}</span>
              <strong>{item.nombre}</strong>
              <small>{exists ? "Configurado" : "Pendiente"}</small>
            </button>
          );
        })}
      </nav>

      <div className="admin-student-lesson__shell">
        <section className="admin-student-lesson__visual">
          <img src={phase.imagenSrc} alt="" aria-hidden="true" />
          <div className="admin-student-lesson__visual-shade" />
          <div className="admin-student-lesson__visual-copy">
            <span>CRECER · {phaseIndex + 1}/6</span>
            <h2>{phase.nombre}</h2>
            <p>{phase.descripcion}</p>
          </div>
        </section>

        <section className="admin-student-lesson__content">
          <div className="admin-student-lesson__progress" aria-label={`Paso ${phaseIndex + 1} de 6`}>
            {FASES_CRECER.map((item, index) => (
              <span key={item.numero} className={index <= phaseIndex ? "is-filled" : ""} />
            ))}
          </div>

          <div className="admin-student-lesson__content-heading">
            <div>
              <span>{theme.titulo || "Tu lección"}</span>
              <h1>{selectedContent?.titulo || phase.nombre}</h1>
            </div>
            {activities.length > 0 ? (
              <strong>{activities.length} {activities.length === 1 ? "actividad" : "actividades"}</strong>
            ) : null}
          </div>

          {selectedContent ? (
            <>
              {selectedContent.instruccion_corta ? (
                <p className="admin-student-lesson__instruction">
                  {selectedContent.instruccion_corta}
                </p>
              ) : null}

              <div className="admin-student-lesson__reading">
                {selectedContent.cuerpo || "El contenido de este momento todavía está vacío."}
              </div>

              {selectedQuestions.length > 0 ? (
                <section className="admin-student-lesson__questions">
                  <div>
                    <FileQuestion size={18} />
                    <h2>Para conversar</h2>
                  </div>
                  <ol>
                    {selectedQuestions.map((question, index) => (
                      <li key={question.id ?? `${question.orden}-${index}`}>
                        <span>{index + 1}</span>
                        {question.pregunta}
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}

              {activities.length > 0 ? (
                <section className="admin-student-lesson__activities">
                  <div className="admin-student-lesson__section-title">
                    <Gamepad2 size={18} />
                    <h2>Actividades de este momento</h2>
                  </div>
                  <div>
                    {activities.map((activity) => (
                      <article key={activity.id}>
                        <span>{activity.tipo_actividad?.nombre ?? "Actividad"}</span>
                        <h3>{activity.titulo}</h3>
                        <p>{activity.consigna}</p>
                        <small>{activity.xp_recompensa} XP</small>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="admin-student-lesson__continue">
                <button type="button" className="admin-student-preview__disabled-control">
                  <span>
                    <small>{phaseIndex < 5 ? `Siguiente: ${FASES_CRECER[phaseIndex + 1]?.nombre}` : "Tema completado"}</small>
                    <strong>Continuar</strong>
                  </span>
                  <ArrowRight />
                </button>
              </div>
            </>
          ) : (
            <div className="admin-student-lesson__empty">
              <Layers3 size={28} />
              <h2>Este momento todavía no tiene contenido para esta franja</h2>
              <p>Completa el título y el contenido principal para poder revisarlo aquí.</p>
              <button type="button" className="admin-primary-button" onClick={onEditCrecer}>
                <Edit3 size={16} />
                Completar en Editor CRECER
              </button>
            </div>
          )}
        </section>
      </div>

      {selectedStep && activities.length === 0 ? (
        <div className="admin-student-lesson__activity-note">
          <Gamepad2 size={17} />
          <span>Este momento no tiene actividades asociadas para la franja seleccionada.</span>
          <button type="button" onClick={onEditActivities}>Agregar actividad</button>
        </div>
      ) : null}
    </div>
  );
}
