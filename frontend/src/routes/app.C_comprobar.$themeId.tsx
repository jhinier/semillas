import { createFileRoute } from "@tanstack/react-router";
import { CrecerLayout } from "@/features/crecer/componentes";
import { ActividadWrapper } from "@/features/crecer/componentes/actividad-wrapper";
import { obtenerFaseCrecer } from "@/features/crecer/crecer-fases";
import { useCrecerFase } from "@/features/crecer/hooks/use-crecer-fase";

export const Route = createFileRoute("/app/C_comprobar/$themeId")({
  component: CComprobarPage,
});

const FASE = obtenerFaseCrecer("comprobar");

function CComprobarPage() {
  const { themeId } = Route.useParams();
  const fase = useCrecerFase({ themeId, pasoCodigo: "comprobar" });

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
      emptyMessage="Esta fase necesita al menos una actividad para comprobar lo aprendido."
      botonesAccion={{
        siguiente: { to: "/app/E_experimentar/$themeId", themeId, label: "Continuar" },
        regresar: { to: "/app/E_ensenar/$themeId", themeId, label: "Anterior" },
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
