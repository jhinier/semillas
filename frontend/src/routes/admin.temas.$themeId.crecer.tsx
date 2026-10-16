import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Circle,
  Eye,
  Image as ImageIcon,
  Layers3,
  Loader2,
  PencilLine,
  Volume2,
} from "lucide-react";

import { AgeGroupSelector, CrecerContentEditor, CrecerMatrixStatus, CrecerStepSelector } from "@/features/admin/componentes/temas";
import { useThemeCrecerPage } from "../features/admin/hooks/use-theme-crecer-page";

export const Route = createFileRoute("/admin/temas/$themeId/crecer")({
  component: AdminThemeCrecerPage,
});

function AdminThemeCrecerPage() {
  const { themeId } = Route.useParams();
  const editor = useThemeCrecerPage({ themeId });

  if (editor.themeQuery.isLoading) {
    return (
      <div className="admin-dashboard-state">
        <span><Loader2 className="animate-spin" /></span>
        <h2>Cargando Editor CRECER</h2>
        <p>Preparando franjas, pasos y recursos multimedia.</p>
      </div>
    );
  }

  if (!editor.theme) {
    return (
      <div className="admin-dashboard-state">
        <span><Layers3 /></span>
        <h2>Tema no encontrado</h2>
        <p>No fue posible abrir el editor.</p>
      </div>
    );
  }

  const availableAgeGroups = editor.ageGroupsQuery.data?.filter(
    (group) =>
      !editor.theme?.grupos_edad?.length ||
      editor.theme.grupos_edad.some((available) => available.id === group.id),
  );

  const isStepReady = (stepCode: string) =>
    Boolean(
      editor.stepsQuery.data?.some(
        (record) =>
          record.tipo_paso?.codigo === stepCode &&
          record.contenidos.some(
            (content) =>
              content.grupo_edad_id === editor.selectedAgeGroupId &&
              content.titulo?.trim() &&
              content.cuerpo?.trim(),
          ),
      ),
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

  return (
    <div className="admin-theme-studio admin-crecer-page">
      <header className="admin-crecer-hero">
        <div className="admin-crecer-hero__identity">
          <button
            type="button"
            className="admin-icon-button admin-crecer-hero__back"
            onClick={editor.handleBack}
            aria-label="Volver al detalle del tema"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="admin-crecer-hero__copy">
            <span className="admin-eyebrow">Editor pedagógico</span>
            <h2>Recorrido CRECER</h2>
            <p>
              <strong>{editor.theme.titulo}</strong>
              <span aria-hidden="true"> · </span>
              contenido específico para cada franja etaria.
            </p>
          </div>
        </div>

        <div
          className="admin-crecer-progress"
          aria-label={`Progreso de la franja: ${editor.pasosCompletos} de ${editor.totalPasos} pasos, ${editor.progreso}%`}
        >
          <div className="admin-crecer-progress__copy">
            <span>Progreso de la franja</span>
            <strong>{editor.pasosCompletos}/{editor.totalPasos} pasos</strong>
          </div>
          <strong className="admin-crecer-progress__value">{editor.progreso}%</strong>
          <div className="admin-crecer-progress__track" aria-hidden="true">
            <span style={{ width: `${editor.progreso}%` }} />
          </div>
        </div>
      </header>

      <CrecerMatrixStatus
        ageGroups={availableAgeGroups ?? []}
        steps={editor.pasos}
        getCell={getMatrixCell}
        onSelect={(ageGroupId, stepCode) => {
          editor.setSelectedAgeGroupId(ageGroupId);
          editor.setActiveStepCode(stepCode);
        }}
      />

      <section className="admin-crecer-workflow" aria-label="Preparación del contenido CRECER">
        <div className="admin-crecer-workflow__intro">
          <span>Preparación</span>
          <p>Selecciona la audiencia y el momento que vas a editar.</p>
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
        </main>

        <aside className="admin-editor-aside" aria-label="Resumen y cobertura del contenido">
          <section className="admin-editor-section admin-crecer-preview">
            <div className="admin-editor-section__header">
              <div>
                <h2>Vista rápida</h2>
                <p>Resumen de lo que verá el estudiante.</p>
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

              <span className="admin-eyebrow">{editor.activeStep?.nombre ?? "Paso"}</span>
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

          <section className="admin-editor-section admin-crecer-coverage">
            <div className="admin-crecer-coverage__header">
              <div>
                <h2>Cobertura de la franja</h2>
                <p>{editor.selectedAgeGroup?.nombre ?? "Franja seleccionada"}</p>
              </div>
              <strong>{editor.pasosCompletos}/{editor.totalPasos}</strong>
            </div>

            <div className="admin-completeness-list">
              {editor.pasos.map((step) => {
                const ready = isStepReady(step.codigo);
                const active = editor.activeStepCode === step.codigo;
                const hasLocalDraft = editor.hasDraftForStep(step.codigo);

                return (
                  <button
                    key={step.codigo}
                    type="button"
                    onClick={() => editor.setActiveStepCode(step.codigo)}
                    className={`admin-completeness-item ${ready ? "admin-completeness-item--complete" : ""} ${active ? "admin-completeness-item--active" : ""}`}
                    aria-current={active ? "step" : undefined}
                  >
                    <span className="admin-completeness-item__status" aria-hidden="true">
                      {hasLocalDraft ? (
                        <PencilLine size={14} className="text-amber-600" />
                      ) : ready ? (
                        <Check size={14} />
                      ) : (
                        <Circle size={13} />
                      )}
                    </span>
                    <span className="admin-completeness-item__label">{step.nombre}</span>
                    <small className={hasLocalDraft ? "!text-amber-700" : undefined}>
                      {hasLocalDraft ? "Borrador" : ready ? "Completo" : active ? "Editando" : "Pendiente"}
                    </small>
                  </button>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
