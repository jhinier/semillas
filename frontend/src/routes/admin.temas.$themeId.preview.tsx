import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Layers3, Loader2 } from "lucide-react";

import { AdminStudentPreviewWorkspace } from "@/features/admin/componentes/temas/admin-student-preview-workspace";
import { useThemePreviewPage } from "@/features/admin/hooks/use-theme-preview-page";
import "./theme-detail.css";

export const Route = createFileRoute("/admin/temas/$themeId/preview")({
  component: AdminThemePreviewPage,
});

function AdminThemePreviewPage() {
  const { themeId } = Route.useParams();
  const preview = useThemePreviewPage({ themeId });

  const isLoading =
    preview.themeQuery.isLoading
    || preview.stepsQuery.isLoading
    || preview.activitiesQuery.isLoading;
  const isError =
    preview.themeQuery.isError
    || preview.stepsQuery.isError
    || preview.activitiesQuery.isError;

  if (isLoading) {
    return (
      <div className="admin-dashboard-state">
        <span><Loader2 className="animate-spin" /></span>
        <h2>Preparando la vista del estudiante</h2>
        <p>Cargando portada, franjas, recorrido CRECER y actividades.</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="admin-dashboard-state" role="alert">
        <span><AlertCircle /></span>
        <h2>No se pudo preparar la vista previa</h2>
        <p>Revisa la conexión y vuelve a intentarlo.</p>
      </div>
    );
  }

  if (!preview.theme) {
    return (
      <div className="admin-dashboard-state">
        <span><Layers3 /></span>
        <h2>Tema no encontrado</h2>
        <p>El tema solicitado ya no está disponible o no tienes acceso.</p>
      </div>
    );
  }

  return (
    <AdminStudentPreviewWorkspace
      theme={preview.theme}
      portadaUrl={preview.portadaUrl}
      estado={preview.estado}
      previewMode={preview.previewMode}
      onPreviewModeChange={preview.setPreviewMode}
      ageGroups={preview.ageGroups}
      selectedAgeGroup={preview.selectedAgeGroup}
      selectedAgeGroupId={preview.selectedAgeGroupId}
      onAgeGroupChange={preview.setSelectedAgeGroupId}
      steps={preview.steps}
      activeStepCode={preview.activeStepCode}
      onStepChange={preview.setActiveStepCode}
      selectedStep={preview.selectedStep}
      selectedContent={preview.selectedContent}
      selectedQuestions={preview.selectedQuestions}
      ageActivities={preview.ageActivities}
      selectedStepActivities={preview.selectedStepActivities}
      completedStepCodes={preview.completedStepCodes}
      onBack={preview.navigateBack}
      onEditTheme={preview.navigateToEdit}
      onEditCrecer={preview.navigateToCrecer}
      onEditActivities={preview.navigateToActivities}
    />
  );
}
