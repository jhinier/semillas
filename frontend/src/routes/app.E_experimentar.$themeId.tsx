import { createFileRoute } from "@tanstack/react-router";
import { CrecerLayout, PreguntasReflexion } from "@/features/crecer/componentes";
import { ActividadWrapper } from "@/features/crecer/componentes/actividad-wrapper";
import { obtenerFaseCrecer } from "@/features/crecer/crecer-fases";
import { useCrecerFase } from "@/features/crecer/hooks/use-crecer-fase";

export const Route = createFileRoute("/app/E_experimentar/$themeId")({
  component: EExperimentarPage,
});

const FASE = obtenerFaseCrecer("experimentar");

function EExperimentarPage() {
  const { themeId } = Route.useParams();
  const fase = useCrecerFase({ themeId, pasoCodigo: "experimentar" });
  const preguntas = fase.pasoActual?.preguntas ?? [];

  return (
    <CrecerLayout
      fase={FASE}
      themeId={themeId}
      themeTitle={fase.themeQuery.data?.titulo}
      paso={fase.contenidoPaso ?? null}
      pasoId={fase.pasoActual?.id}
      isLoading={fase.isLoading}
      isError={fase.isError}
      activityCount={fase.actividadesFase.length}
      isSavingProgress={fase.isSavingProgress}
      progressError={fase.progressError}
      onCompleteStep={fase.completeStep}
      emptyMessage="No hay preguntas ni actividades disponibles para esta fase."
      botonesAccion={{
        siguiente: { to: "/app/R_recompensar/$themeId", themeId, label: "Finalizar tema" },
        regresar: { to: "/app/C_comprobar/$themeId", themeId, label: "Anterior" },
      }}
    >
      {preguntas.length > 0 ? <PreguntasReflexion preguntas={preguntas} /> : null}
      {fase.actividadesFase.map((actividad) => (
        <ActividadWrapper
          key={actividad.id}
          actividad={actividad}
          onComplete={fase.handleActivityComplete}
        />
      ))}
    </CrecerLayout>
  );
}
