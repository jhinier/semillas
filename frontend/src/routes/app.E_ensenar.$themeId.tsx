import { createFileRoute } from "@tanstack/react-router";
import { CrecerLayout } from "@/features/crecer/componentes";
import { ActividadWrapper } from "@/features/crecer/componentes/actividad-wrapper";
import { obtenerFaseCrecer } from "@/features/crecer/crecer-fases";
import { useCrecerFase } from "@/features/crecer/hooks/use-crecer-fase";

export const Route = createFileRoute("/app/E_ensenar/$themeId")({
  component: EEnsenarPage,
});

const FASE = obtenerFaseCrecer("ensenar");

function EEnsenarPage() {
  const { themeId } = Route.useParams();
  const fase = useCrecerFase({ themeId, pasoCodigo: "ensenar" });

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
        siguiente: { to: "/app/C_comprobar/$themeId", themeId, label: "Continuar" },
        regresar: { to: "/app/R_relatar/$themeId", themeId, label: "Anterior" },
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
