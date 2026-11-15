import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Image as ImageIcon,
  Layers3,
  Loader2,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";

import { AgeGroupSelector, CrecerContentEditor, CrecerMatrixStatus, CrecerStepSelector } from "@/features/admin/componentes/temas";
import { obtenerEstudioTemaAdmin } from "../features/admin/admin.api";
import { ThemeWorkflowStepper } from "../features/admin/componentes/temas/theme-workflow-stepper";
import { useThemeCrecerPage } from "../features/admin/hooks/use-theme-crecer-page";

export const Route = createFileRoute("/admin/temas/$themeId/crecer")({
  component: AdminThemeCrecerPage,
});

function AdminThemeCrecerPage() {
  const { themeId } = Route.useParams();
  const navigate = useNavigate();
  const editor = useThemeCrecerPage({ themeId });
  const estudioQuery = useQuery({
    queryKey: ["admin", "theme", themeId, "studio"],
    queryFn: () => obtenerEstudioTemaAdmin(themeId),
  });

  if (editor.themeQuery.isLoading) {
    return (
      <div className="admin-dashboard-state">
        <span><Loader2 className="animate-spin" /></span>
        <h2>Cargando Enseñanza CRECER</h2>
        <p>Preparando momentos, edades y recursos.</p>
      </div>
    );
  }

  if (!editor.theme) {
    return (
      <div className="admin-dashboard-state">
        <span><Layers3 /></span>
        <h2>Tema no encontrado</h2>
        <p>No fue posible abrir este paso.</p>
      </div>
    );
  }

  const availableAgeGroups = editor.ageGroupsQuery.data?.filter(
    (group) =>
      !editor.theme?.grupos_edad?.length ||
      editor.theme.grupos_edad.some((available) => available.id === group.id),
  );

  const getMatrixCell = (ageGroupId: string, stepCode: string) => {
    if (editor.hasDraftForCell(ageGroupId, stepCode)) return "draft" as const;
    const record = editor.stepsQuery.data?.find((step) => step.tipo_paso?.codigo === stepCode);
    const content = record?.contenidos?.find((item) => item.grupo_edad_id === ageGroupId);
    if (content?.titulo?.trim() && content.cuerpo?.trim() && content.cuerpo !== "Contenido pendiente...") {
      return "complete" as const;
    }
    return "missing" as const;
  };

  const currentStepIndex = editor.pasos.findIndex((p) => p.codigo === editor.activeStepCode);
  const nextMoment =
    currentStepIndex >= 0 && currentStepIndex < editor.pasos.length - 1
      ? editor.pasos[currentStepIndex + 1]
      : null;

  const totalContenidosGuardados =
    estudioQuery.data?.completitud?.estadisticas?.contenidos_creados ??
    (editor.stepsQuery.data?.reduce((acc, s) => acc + (s.contenidos?.length ?? 0), 0) ?? 0);

  const handleSaveAndNextMoment = async () => {
    try {
      if (editor.isCurrentDirty) {
        await editor.saveCurrentDraftAsync();
      }
      if (nextMoment) {
        editor.setActiveStepCode(nextMoment.codigo);
      } else {
        navigate({
          to: "/admin/temas/$themeId/activities",
          params: { themeId },
        });
      }
    } catch {
      // El hook saveMutation ya muestra toast.error con la validación exacta
    }
  };

  const handleContinueToActivities = async () => {
    try {
      if (editor.isCurrentDirty) {
        await editor.saveCurrentDraftAsync();
      }
      const updatedCount =
        editor.isCurrentDirty || totalContenidosGuardados === 0
          ? (editor.stepsQuery.data?.reduce((acc, s) => acc + (s.contenidos?.length ?? 0), 0) ?? 0) +
            (editor.isCurrentDirty ? 1 : 0)
          : totalContenidosGuardados;
      if (updatedCount === 0) {
        toast.error("Guarda al menos un momento de enseñanza CRECER antes de pasar a Actividades.");
        return;
      }
      navigate({
        to: "/admin/temas/$themeId/activities",
        params: { themeId },
      });
    } catch {
      // toast mostrado por la mutación
    }
  };

  return (
    <div className="admin-theme-studio admin-crecer-page">
      <header className="admin-crecer-hero">
        <div className="admin-crecer-hero__identity">
          <button
            type="button"
            className="admin-icon-button admin-crecer-hero__back"
            onClick={editor.handleBack}
            aria-label="Volver al resumen del tema"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="admin-crecer-hero__copy">
            <span className="admin-eyebrow">Paso 3 de 5 · Enseñanza CRECER</span>
            <h2>Momentos de enseñanza CRECER</h2>
            <p>
              <strong>{editor.theme.titulo}</strong>
              <span aria-hidden="true"> · </span>
              completa cada momento en orden para tus grupos de edad.
            </p>
          </div>
        </div>

        <div
          className="admin-crecer-progress"
          aria-label={`Progreso de esta edad: ${editor.pasosCompletos} de ${editor.totalPasos} momentos, ${editor.progreso}%`}
        >
          <div className="admin-crecer-progress__copy">
            <span>Progreso en {editor.selectedAgeGroup?.nombre ?? "edad actual"}</span>
            <strong>{editor.pasosCompletos}/{editor.totalPasos} momentos</strong>
          </div>
          <strong className="admin-crecer-progress__value">{editor.progreso}%</strong>
          <div className="admin-crecer-progress__track" aria-hidden="true">
            <span style={{ width: `${editor.progreso}%` }} />
          </div>
        </div>
      </header>

      <ThemeWorkflowStepper
        currentStep={3}
        themeId={themeId}
        themeEstado={editor.theme.estado}
        completitud={estudioQuery.data?.completitud}
      />

      <section className="admin-crecer-workflow" aria-label="Selección de edad y momento">
        <div className="admin-crecer-workflow__intro">
          <span>¿Cómo completar este paso?</span>
          <p>Paso 1: elige la edad · Paso 2: elige un momento (del 1 al 6) · Paso 3: escribe el título y el texto abajo y pulsa «Guardar este momento».</p>
        </div>

        <div className="admin-crecer-workflow__controls">
          {availableAgeGroups ? (
            <AgeGroupSelector
              ageGroups={availableAgeGroups}
              selectedAgeGroupId={editor.selectedAgeGroupId}
              onSelect={editor.setSelectedAgeGroupId}
              hasDraft={editor.hasDraftForAgeGroup}
            />
          ) : null}

          <CrecerStepSelector
            pasos={editor.pasos}
            activeStepCode={editor.activeStepCode}
            selectedAgeGroupId={editor.selectedAgeGroupId}
            stepsData={editor.stepsQuery.data}
            onSelect={editor.setActiveStepCode}
            hasDraft={editor.hasDraftForStep}
          />
        </div>
      </section>

      <div className="admin-editor-shell">
        <main className="admin-editor-main">
          <CrecerContentEditor
            activeStep={editor.activeStep}
            selectedAgeGroup={editor.selectedAgeGroup}
            title={editor.title}
            body={editor.body}
            shortInstruction={editor.shortInstruction}
            resourceId={editor.resourceId}
            audioResourceId={editor.audioResourceId}
            resources={editor.media}
            questions={editor.questions}
            onTitleChange={editor.setTitle}
            onBodyChange={editor.setBody}
            onShortInstructionChange={editor.setShortInstruction}
            onResourceChange={editor.setResourceId}
            onAudioResourceChange={editor.setAudioResourceId}
            onQuestionsChange={editor.setQuestions}
            onUpload={(file, type, metadata) =>
              editor.uploadMutation.mutateAsync({ file, type, metadata })
            }
            onSave={editor.saveCurrentDraft}
            isPending={editor.saveMutation.isPending}
            isUploading={editor.uploadMutation.isPending}
            isSuccess={editor.isCurrentSaved}
            isDirty={editor.isCurrentDirty}
            unsavedDraftCount={editor.unsavedDraftCount}
          />

          <div className="admin-step-footer-bar">
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() =>
                navigate({
                  to: "/admin/temas/$themeId/edit",
                  params: { themeId },
                  search: { tab: "portada" },
                })
              }
            >
              <ArrowLeft size={16} /> Paso anterior: Portada
            </button>

            <div className="flex flex-wrap gap-2">
              {nextMoment ? (
                <button
                  type="button"
                  className="admin-secondary-button"
                  disabled={editor.saveMutation.isPending}
                  onClick={() => void handleSaveAndNextMoment()}
                >
                  {editor.isCurrentDirty ? `Guardar e ir a ${nextMoment.nombre}` : `Siguiente momento: ${nextMoment.nombre}`}{" "}
                  <ArrowRight size={16} />
                </button>
              ) : null}

              <button
                type="button"
                className="admin-primary-button"
                disabled={editor.saveMutation.isPending}
                onClick={() => void handleContinueToActivities()}
              >
                Continuar al Paso 4: Actividades <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </main>

        <aside className="admin-editor-aside" aria-label="Vista previa del momento actual">
          <section className="admin-editor-section admin-crecer-preview">
            <div className="admin-editor-section__header">
              <div>
                <h2>Vista previa rápida</h2>
                <p>Así lo verá el estudiante en pantalla.</p>
              </div>
              <span className="admin-crecer-preview__icon" aria-hidden="true">
                <Eye size={18} />
              </span>
            </div>

            <div className="admin-crecer-preview__card">
              {editor.selectedResource?.tipo === "imagen" ? (
                <img
                  src={editor.selectedResource.url_publica}
                  alt={editor.selectedResource.texto_alternativo ?? "Vista previa del recurso"}
                  className="admin-crecer-preview__media"
                />
              ) : (
                <div className="admin-crecer-preview__placeholder" aria-hidden="true">
                  <ImageIcon />
                </div>
              )}

              <span className="admin-eyebrow">{editor.activeStep?.nombre ?? "Momento"}</span>
              <h3>{editor.title || "Título pendiente"}</h3>
              <p>{editor.body || "Escribe el contenido para ver una previsualización."}</p>

              {editor.selectedAudio ? (
                <div className="admin-crecer-preview__audio">
                  <Volume2 size={16} />
                  Incluye narración de audio
                </div>
              ) : null}
            </div>
          </section>
        </aside>
      </div>

      <CrecerMatrixStatus
        ageGroups={availableAgeGroups ?? []}
        steps={editor.pasos}
        activeAgeGroupId={editor.selectedAgeGroupId}
        activeStepCode={editor.activeStepCode}
        getCell={getMatrixCell}
        onSelect={(ageGroupId, stepCode) => {
          editor.setSelectedAgeGroupId(ageGroupId);
          editor.setActiveStepCode(stepCode);
        }}
      />
    </div>
  );
}
