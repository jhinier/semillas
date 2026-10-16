import { createFileRoute } from "@tanstack/react-router";
import { CrecerLayout } from "@/features/crecer/componentes";
import { ActividadWrapper } from "@/features/crecer/componentes/actividad-wrapper";
import { obtenerFaseCrecer } from "@/features/crecer/crecer-fases";
import { useCrecerFase } from "@/features/crecer/hooks/use-crecer-fase";

export const Route = createFileRoute("/app/C_conectar/$themeId")({
  component: CConectarPage,
});

const FASE = obtenerFaseCrecer("conectar");

function CConectarPage() {
  const { themeId } = Route.useParams();
  const fase = useCrecerFase({ themeId, pasoCodigo: "conectar" });

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
      botonesAccion={{
        siguiente: {
          to: "/app/R_relatar/$themeId",
          themeId,
          label: "Continuar",
        },
        regresar: {
          to: "/app/temas/$themeId",
          themeId,
          label: "Volver al tema",
        },
      }}
    >
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
