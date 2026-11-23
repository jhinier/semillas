import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  FileQuestion,
  Gamepad2,
  Image as ImageIcon,
  Layers3,
  Play,
  Quote,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";

import type { Actividad } from "@/shared/api/api";
import { ContenidoMarkdown, limpiarMarkdownATextoPlano } from "@/componentes/ui/contenido-markdown";
import {
  obtenerLibrosBiblicos,
  obtenerLibrosBiblicosSincrono,
  obtenerNombreLibroBiblico,
} from "@/features/catalog/catalog.api";
import { FASES_CRECER } from "@/features/crecer/crecer-fases";
import { ActividadWrapper } from "@/features/crecer/componentes/actividad-wrapper";
import { NarradorPaso } from "@/features/crecer/componentes/narrador-paso";
import { useResolvedMediaUrl } from "@/features/media/use-resolved-media-url";
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
  recurso_id?: string | null;
  recurso_audio_id?: string | null;
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
  versiculo_clave?: {
    texto?: string | null;
    libro_id?: number | null;
    capitulo?: number | null;
    versiculo?: number | null;
    parte_historia?: string | null;
  } | null;
  referencia_biblica?: {
    libro_id?: number | null;
    capitulo?: number | null;
    versiculo_inicio?: number | null;
    parte_historia?: string | null;
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
  const [simulatedStepCodes, setSimulatedStepCodes] = useState<string[]>([]);
  const [simulatedActivityIds, setSimulatedActivityIds] = useState<string[]>([]);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  useEffect(() => {
    setSimulatedStepCodes([]);
    setSimulatedActivityIds([]);
    setLessonCompleted(false);
  }, [selectedAgeGroupId, theme.id]);

  const simulatedStepSet = useMemo(() => new Set(simulatedStepCodes), [simulatedStepCodes]);
  const simulatedActivitySet = useMemo(() => new Set(simulatedActivityIds), [simulatedActivityIds]);
  const hasSimulationProgress =
    simulatedStepCodes.length > 0 || simulatedActivityIds.length > 0 || lessonCompleted;
  const simulatedProgressPercent = Math.round(
    (simulatedStepSet.size / Math.max(1, FASES_CRECER.length)) * 100,
  );

  const handleResetSimulation = () => {
    setSimulatedStepCodes([]);
    setSimulatedActivityIds([]);
    setLessonCompleted(false);
    onStepChange(FASES_CRECER[0]?.codigo ?? "conectar");
  };

  const handleStartLesson = () => {
    if (simulatedStepCodes.length === 0) {
      onStepChange(FASES_CRECER[0]?.codigo ?? "conectar");
    }
    setLessonCompleted(false);
    onPreviewModeChange("lesson");
  };

  const handleSelectStepFromOverview = (stepCode: string) => {
    setLessonCompleted(false);
    onStepChange(stepCode);
    onPreviewModeChange("lesson");
  };

  const handleContinueLessonStep = () => {
    const currentIndex = Math.max(
      0,
      FASES_CRECER.findIndex((item) => item.codigo === activeStepCode),
    );
    const currentCode = FASES_CRECER[currentIndex]?.codigo;
    if (currentCode) {
      setSimulatedStepCodes((prev) => (prev.includes(currentCode) ? prev : [...prev, currentCode]));
    }
    if (currentIndex < FASES_CRECER.length - 1) {
      const nextCode = FASES_CRECER[currentIndex + 1]?.codigo ?? "conectar";
      onStepChange(nextCode);
      setLessonCompleted(false);
    } else {
      setLessonCompleted(true);
    }
  };

  const handleSimulateActivityComplete = (activityId: string) => {
    setSimulatedActivityIds((prev) => (prev.includes(activityId) ? prev : [...prev, activityId]));
  };

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

          {ageGroups.length === 1 ? (
            <div className="admin-student-preview__age" aria-label="Franja de edad del tema">
              <span>Franja del tema</span>
              <strong className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                {ageGroups[0]!.nombre ?? "Franja"}
              </strong>
            </div>
          ) : (
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
          )}
        </div>
      </header>

      <div className="admin-student-preview__notice" role="note">
        <Eye size={16} />
        <span>
          Simulación interactiva para <strong>{selectedAgeGroup?.nombre ?? "la franja seleccionada"}</strong>:
          recorre los momentos CRECER y prueba las actividades sin guardar progreso real.
        </span>
        {hasSimulationProgress ? (
          <button
            type="button"
            className="admin-student-preview__reset"
            onClick={handleResetSimulation}
          >
            <RotateCcw size={13} />
            Reiniciar simulación
          </button>
        ) : null}
      </div>

      <section className="admin-student-preview__frame" aria-label="Simulación de la experiencia del estudiante">
        <div className="admin-student-preview__framebar" aria-hidden="true">
          <span />
          <span />
          <span />
          <strong>Semillas · vista interactiva del estudiante</strong>
        </div>

        <div className="admin-student-preview__viewport">
          {previewMode === "overview" ? (
            <ThemeOverviewPreview
              theme={theme}
              portadaUrl={portadaUrl}
              steps={steps}
              ageActivities={ageActivities}
              completedStepCodes={completedStepCodes}
              simulatedStepCodes={simulatedStepSet}
              simulatedProgressPercent={simulatedProgressPercent}
              lessonCompleted={lessonCompleted}
              onStartLesson={handleStartLesson}
              onSelectStep={handleSelectStepFromOverview}
            />
          ) : (
            <LessonPreview
              theme={theme}
              steps={steps}
              ageActivities={ageActivities}
              activeStepCode={activeStepCode}
              onStepChange={(code) => {
                setLessonCompleted(false);
                onStepChange(code);
              }}
              onBackToOverview={() => onPreviewModeChange("overview")}
              onContinueStep={handleContinueLessonStep}
              simulatedStepCodes={simulatedStepSet}
              simulatedActivityIds={simulatedActivitySet}
              onSimulateActivityComplete={handleSimulateActivityComplete}
              lessonCompleted={lessonCompleted}
              onResetSimulation={handleResetSimulation}
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
  ageActivities,
  completedStepCodes,
  simulatedStepCodes,
  simulatedProgressPercent,
  lessonCompleted,
  onStartLesson,
  onSelectStep,
}: {
  theme: PreviewTheme;
  portadaUrl: string | null;
  steps: PreviewStep[];
  ageActivities: ActividadAdmin[];
  completedStepCodes: Set<string>;
  simulatedStepCodes: Set<string>;
  simulatedProgressPercent: number;
  lessonCompleted: boolean;
  onStartLesson: () => void;
  onSelectStep: (stepCode: string) => void;
}) {
  const startLabel = lessonCompleted
    ? "Volver a recorrer lección"
    : simulatedStepCodes.size > 0
      ? "Continuar lección"
      : "Comenzar lección";

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
              <span>{simulatedProgressPercent}%</span>
            </div>
            <div
              className="theme-detail__progress-track"
              aria-label={`${simulatedProgressPercent}% completado`}
            >
              <span style={{ width: `${simulatedProgressPercent}%` }} />
            </div>
            <small>
              {simulatedStepCodes.size > 0
                ? `Avance en simulación: ${simulatedStepCodes.size} de ${FASES_CRECER.length} pasos completados.`
                : "Pulsa Comenzar lección o haz clic en cualquier paso inferior para probarlo."}
            </small>
          </div>

          <div className="theme-detail__actions">
            <button type="button" className="theme-detail__primary" onClick={onStartLesson}>
              <Play fill="currentColor" />
              {startLabel}
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
          <p>Haz clic en cualquier momento CRECER para probar su lectura, preguntas y actividades.</p>
        </div>

        <ol className="theme-detail__steps">
          {FASES_CRECER.map((phase) => {
            const code = phase.codigo ?? "conectar";
            const stepRecord = steps.find((s) => s.tipo_paso?.codigo === code);
            const countActs = stepRecord
              ? ageActivities.filter((a) => a.paso_id === stepRecord.id).length
              : 0;
            const available = completedStepCodes.has(code);
            const simulatedDone = simulatedStepCodes.has(code);
            const stateClass = simulatedDone
              ? "is-complete"
              : available
                ? "is-available"
                : "";
            return (
              <li key={phase.numero} className={stateClass}>
                <button
                  type="button"
                  className="admin-student-preview__step-button"
                  onClick={() => onSelectStep(code)}
                >
                  <span className="theme-detail__step-number">
                    {simulatedDone || available ? <Check aria-hidden="true" /> : phase.numero}
                  </span>
                  <div>
                    <strong>{phase.nombre}</strong>
                    <p>{phase.descripcion}</p>
                    <small className="admin-student-preview__step-cta">
                      {simulatedDone
                        ? "Completado en simulación"
                        : countActs > 0
                          ? `Probar paso (${countActs} ${countActs === 1 ? "actividad" : "actividades"}) →`
                          : available
                            ? "Probar paso →"
                            : "Revisar paso →"}
                    </small>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <GeneralVerseFooterCard theme={theme} />
    </div>
  );
}

function LessonPreview({
  theme,
  steps,
  ageActivities,
  activeStepCode,
  onStepChange,
  onBackToOverview,
  onContinueStep,
  simulatedStepCodes,
  simulatedActivityIds,
  onSimulateActivityComplete,
  lessonCompleted,
  onResetSimulation,
  selectedStep,
  selectedContent,
  selectedQuestions,
  activities,
  onEditCrecer,
  onEditActivities,
}: {
  theme: PreviewTheme;
  steps: PreviewStep[];
  ageActivities: ActividadAdmin[];
  activeStepCode: string;
  onStepChange: (code: string) => void;
  onBackToOverview: () => void;
  onContinueStep: () => void;
  simulatedStepCodes: Set<string>;
  simulatedActivityIds: Set<string>;
  onSimulateActivityComplete: (activityId: string) => void;
  lessonCompleted: boolean;
  onResetSimulation: () => void;
  selectedStep: PreviewStep | null;
  selectedContent: StepContent | null;
  selectedQuestions: ReflectionQuestion[];
  activities: ActividadAdmin[];
  onEditCrecer: () => void;
  onEditActivities: () => void;
}) {
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [replaySeed, setReplaySeed] = useState(0);

  useEffect(() => {
    setSelectedActivityId(activities[0]?.id ?? "");
    setReplaySeed(0);
  }, [activeStepCode, activities]);

  const activeActivity =
    activities.find((activity) => activity.id === selectedActivityId) ?? activities[0] ?? null;

  const phase = FASES_CRECER.find((item) => item.codigo === activeStepCode) ?? FASES_CRECER[0]!;
  const phaseIndex = Math.max(0, FASES_CRECER.findIndex((item) => item.codigo === phase.codigo));
  const stepVisualMedia = useResolvedMediaUrl({
    resourceId: selectedContent?.recurso_id ?? null,
    rawUrl: null,
    fallbackHint: selectedContent?.titulo || phase.nombre,
    useFallbackOnError: false,
  });

  const textoNarracion = useMemo(() => {
    if (!selectedContent) return null;
    const partes = [
      selectedContent.titulo,
      selectedContent.instruccion_corta,
      limpiarMarkdownATextoPlano(selectedContent.cuerpo),
    ].filter((v): v is string => Boolean(v && v.trim()));
    return partes.length > 0 ? partes.join(". ") : null;
  }, [selectedContent]);

  const stepsConActividades = useMemo(() => {
    return FASES_CRECER.map((item) => {
      const codigo = item.codigo ?? "conectar";
      const stepRec = steps.find((s) => s.tipo_paso?.codigo === codigo);
      const total = stepRec
        ? ageActivities.filter((a) => a.paso_id === stepRec.id).length
        : 0;
      return { codigo, nombre: item.nombre, total };
    }).filter((item) => item.total > 0);
  }, [ageActivities, steps]);

  const style = {
    "--preview-phase": phase.colorAccent,
    "--preview-phase-soft": phase.colorSuave ?? "#eef6ef",
    "--lesson-accent": phase.colorAccent,
    "--lesson-soft": phase.colorSuave ?? "#eef6ef",
  } as CSSProperties;

  return (
    <div className="admin-student-lesson" style={style}>
      <div className="admin-student-lesson__topbar">
        <button
          type="button"
          className="admin-student-lesson__overview-back"
          onClick={onBackToOverview}
        >
          <ArrowLeft size={15} />
          Volver a la portada
        </button>
        <span className="admin-student-lesson__sim-stats">
          {simulatedStepCodes.size}/6 pasos recorridos · {simulatedActivityIds.size}{" "}
          {simulatedActivityIds.size === 1 ? "actividad probada" : "actividades probadas"}
        </span>
      </div>

      <nav className="admin-student-lesson__steps" aria-label="Momentos CRECER">
        {FASES_CRECER.map((item) => {
          const code = item.codigo ?? "conectar";
          const stepRecord = steps.find((step) => step.tipo_paso?.codigo === item.codigo);
          const exists = Boolean(stepRecord);
          const actCount = stepRecord
            ? ageActivities.filter((a) => a.paso_id === stepRecord.id).length
            : 0;
          const simulated = simulatedStepCodes.has(code);
          return (
            <button
              key={item.numero}
              type="button"
              className={`${code === activeStepCode ? "is-active" : ""} ${simulated ? "is-simulated-done" : ""}`.trim()}
              aria-current={code === activeStepCode ? "step" : undefined}
              onClick={() => onStepChange(code)}
            >
              <span>{simulated ? <Check size={14} /> : item.numero}</span>
              <strong>{item.nombre}</strong>
              <small>
                {simulated
                  ? "Probado"
                  : actCount > 0
                    ? `${actCount} act.`
                    : exists
                      ? "Configurado"
                      : "Pendiente"}
              </small>
            </button>
          );
        })}
      </nav>

      <div className="admin-student-lesson__shell">
        <section className="admin-student-lesson__visual">
          <img src={stepVisualMedia.src || phase.imagenSrc} alt="" aria-hidden="true" />
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

              {selectedContent.recurso_audio_id || textoNarracion ? (
                <div className="mt-3">
                  <NarradorPaso
                    recursoAudioId={selectedContent.recurso_audio_id}
                    textoNarracion={textoNarracion}
                    tituloPaso={
                      phase.codigo === "relatar"
                        ? "Escuchar el relato de la historia"
                        : "Escucha este paso"
                    }
                    habilitado
                  />
                </div>
              ) : null}

              <div className="admin-student-lesson__reading">
                {selectedContent.cuerpo?.trim() ? (
                  <ContenidoMarkdown texto={selectedContent.cuerpo} />
                ) : (
                  <p>El contenido de este momento todavía está vacío.</p>
                )}
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
            </>
          ) : (
            <div className={activities.length > 0 ? "my-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 dark:border-amber-500/35 dark:bg-amber-950/35 dark:text-amber-100" : "admin-student-lesson__empty"}>
              {activities.length > 0 ? (
                <>
                  <span>
                    <strong>Texto CRECER pendiente para esta franja:</strong> puedes editarlo cuando quieras o probar abajo las actividades configuradas.
                  </span>
                  <button type="button" className="admin-secondary-button" onClick={onEditCrecer}>
                    <Edit3 size={14} /> Editar texto
                  </button>
                </>
              ) : (
                <>
                  <Layers3 size={28} />
                  <h2>Este momento todavía no tiene contenido para esta franja</h2>
                  <p>Completa el título y el contenido principal para poder revisarlo aquí.</p>
                  <button type="button" className="admin-primary-button" onClick={onEditCrecer}>
                    <Edit3 size={16} />
                    Completar en Editor CRECER
                  </button>
                </>
              )}
            </div>
          )}

          {activities.length > 0 ? (
            <section className="admin-student-lesson__activities">
              <div className="admin-student-lesson__section-title">
                <Gamepad2 size={18} />
                <h2>Actividades interactivas de este momento</h2>
              </div>

              {activities.length > 1 ? (
                <div className="admin-student-lesson__activity-picker" role="tablist" aria-label="Elegir actividad a probar">
                  {activities.map((activity, index) => {
                    const selected = activeActivity?.id === activity.id;
                    const probada = simulatedActivityIds.has(activity.id);
                    return (
                      <button
                        key={activity.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        className={`admin-student-lesson__activity-tab ${selected ? "is-selected" : ""}`}
                        onClick={() => {
                          setSelectedActivityId(activity.id);
                          setReplaySeed(0);
                        }}
                      >
                        <div>
                          <span>{activity.tipo_actividad?.nombre ?? `Actividad ${index + 1}`}</span>
                          <strong>{activity.titulo}</strong>
                        </div>
                        <small>
                          {probada ? (
                            <span className="admin-student-lesson__activity-done">
                              <CheckCircle2 size={13} /> Probada
                            </span>
                          ) : (
                            `${activity.xp_recompensa} XP`
                          )}
                        </small>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {activeActivity ? (
                <div className="admin-student-lesson__simulator">
                  <div className="admin-student-lesson__simulator-bar">
                    <div>
                      <span className="admin-student-lesson__simulator-pill">
                        {activeActivity.tipo_actividad?.nombre ?? "Actividad"}
                      </span>
                      <strong>{activeActivity.xp_recompensa} XP simulados</strong>
                      {simulatedActivityIds.has(activeActivity.id) ? (
                        <span className="admin-student-lesson__activity-done">
                          <CheckCircle2 size={14} /> Completada en simulación
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="admin-student-lesson__simulator-replay"
                      onClick={() => setReplaySeed((seed) => seed + 1)}
                    >
                      <RotateCcw size={13} />
                      Reiniciar actividad
                    </button>
                  </div>

                  <ActividadWrapper
                    key={`${activeStepCode}-${activeActivity.id}-${replaySeed}`}
                    actividad={adaptarActividadParaPreview(activeActivity)}
                    mode="preview"
                    onComplete={(id) => onSimulateActivityComplete(id)}
                  />
                </div>
              ) : null}
            </section>
          ) : stepsConActividades.length > 0 ? (
            <div className="admin-student-lesson__activity-note flex-wrap">
              <Gamepad2 size={17} />
              <span>
                Este momento no tiene actividades, pero esta franja tiene actividades en:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {stepsConActividades.map((item) => (
                  <button
                    key={item.codigo}
                    type="button"
                    className="rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-xs font-bold text-violet-700 hover:bg-violet-50 dark:border-amber-500/40 dark:bg-slate-900 dark:text-violet-300"
                    onClick={() => onStepChange(item.codigo)}
                  >
                    {item.nombre} ({item.total})
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {lessonCompleted && phaseIndex === 5 ? (
            <section className="admin-student-lesson__complete-banner" role="status">
              <div className="admin-student-lesson__complete-copy">
                <span className="admin-student-lesson__complete-icon" aria-hidden="true">
                  <Trophy size={22} />
                </span>
                <div>
                  <strong>¡Recorrido simulado completado!</strong>
                  <p>
                    Probaste {simulatedStepCodes.size} de 6 momentos y {simulatedActivityIds.size}{" "}
                    {simulatedActivityIds.size === 1 ? "actividad" : "actividades"} sin guardar datos reales.
                  </p>
                </div>
              </div>
              <div className="admin-student-lesson__complete-actions">
                <button type="button" className="admin-secondary-button" onClick={onResetSimulation}>
                  <RotateCcw size={14} />
                  Reiniciar
                </button>
                <button type="button" className="admin-primary-button" onClick={onBackToOverview}>
                  Volver a la portada
                </button>
              </div>
            </section>
          ) : null}

          <div className="admin-student-lesson__continue">
            <button type="button" onClick={onContinueStep}>
              <span>
                <small>{phaseIndex < 5 ? `Siguiente: ${FASES_CRECER[phaseIndex + 1]?.nombre}` : "Último paso del recorrido"}</small>
                <strong>{phaseIndex < 5 ? "Continuar" : "Finalizar recorrido"}</strong>
              </span>
              <ArrowRight />
            </button>
          </div>

          <div className="mt-6">
            <GeneralVerseFooterCard theme={theme} />
          </div>
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

function adaptarActividadParaPreview(actividad: ActividadAdmin): Actividad {
  const codigo = actividad.tipo_actividad?.codigo ?? "cuestionario";
  return {
    id: actividad.id,
    tema_id: actividad.tema_id,
    paso_id: actividad.paso_id,
    grupo_edad_id: actividad.grupo_edad_id,
    tipo_actividad_id: actividad.tipo_actividad_id,
    titulo: actividad.titulo,
    consigna: actividad.consigna,
    orden: actividad.orden,
    xp_recompensa: actividad.xp_recompensa,
    dificultad: actividad.dificultad,
    limite_tiempo_seg: actividad.limite_tiempo_seg,
    obligatorio: actividad.obligatorio,
    retroalimentacion: actividad.retroalimentacion,
    configuracion: actividad.configuracion ?? {},
    tipo_actividad: actividad.tipo_actividad
      ? {
          id: actividad.tipo_actividad.id,
          codigo: actividad.tipo_actividad.codigo,
          nombre: actividad.tipo_actividad.nombre,
          descripcion: null,
          es_juego: true,
          activo: true,
          creado_en: new Date(0).toISOString(),
        }
      : {
          id: actividad.tipo_actividad_id,
          codigo,
          nombre: "Actividad",
          descripcion: null,
          es_juego: true,
          activo: true,
          creado_en: new Date(0).toISOString(),
        },
    opciones: (actividad.opciones ?? []).map((opcion, index) => ({
      id: opcion.id,
      actividad_id: opcion.actividad_id,
      etiqueta: opcion.etiqueta || String.fromCharCode(65 + index),
      texto: opcion.texto,
      correcta: opcion.correcta,
      orden: opcion.orden,
      retroalimentacion: opcion.retroalimentacion,
    })),
  };
}

function GeneralVerseFooterCard({ theme }: { theme: PreviewTheme }) {
  const [libros, setLibros] = useState(obtenerLibrosBiblicosSincrono);
  useEffect(() => {
    let active = true;
    void obtenerLibrosBiblicos().then((lista) => {
      if (active) setLibros(lista);
    });
    return () => {
      active = false;
    };
  }, []);

  const versiculo = theme.versiculo_clave;
  const referencia = theme.referencia_biblica;
  if (!versiculo?.texto && !referencia?.libro_id) return null;

  const libroNombre = obtenerNombreLibroBiblico(
    versiculo?.libro_id ?? referencia?.libro_id ?? null,
    libros,
  );
  const capitulo = versiculo?.capitulo ?? referencia?.capitulo ?? 1;
  const numVersiculo = versiculo?.versiculo ?? referencia?.versiculo_inicio ?? 1;
  const cita = `${libroNombre} ${capitulo}:${numVersiculo}`;
  const parteHistoria = versiculo?.parte_historia ?? referencia?.parte_historia ?? null;

  return (
    <section
      aria-label="Versículo general del tema"
      className="mt-6 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50/90 via-white to-indigo-50/70 p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-violet-800">
          <BookOpen size={14} /> Versículo general · {cita}
        </span>
        {parteHistoria ? (
          <span className="rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
            Historia: {parteHistoria}
          </span>
        ) : null}
      </div>
      {versiculo?.texto ? (
        <blockquote className="mt-3 flex items-start gap-2.5 text-base font-bold italic leading-relaxed text-slate-800">
          <Quote size={18} className="mt-0.5 shrink-0 text-violet-500" />
          <span>“{versiculo.texto}”</span>
        </blockquote>
      ) : null}
      <p className="mt-2 text-right text-xs font-extrabold uppercase tracking-wider text-violet-700">
        — {cita}{parteHistoria ? ` · ${parteHistoria}` : ""}
      </p>
    </section>
  );
}
