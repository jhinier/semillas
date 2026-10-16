import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, CloudOff, Gamepad2, Loader2, RotateCcw, Sparkles, Timer, Trophy } from "lucide-react";

import { ActividadWrapper } from "@/features/crecer/componentes/actividad-wrapper";
import { useActivityPage } from "../features/activities/hooks/use-activity-page";
import "./app-activity-page.css";

export const Route = createFileRoute("/app/actividades/$activityId")({
  component: ActivityPage,
});

function ActivityPage() {
  const { activityId } = Route.useParams();
  const {
    activity,
    completed,
    resultadoOffline,
    handleComplete,
    handleGoBack,
    activityQuery,
    completionMutation,
  } = useActivityPage(activityId);

  if (activityQuery.isLoading) {
    return <div className="student-activity-state"><Loader2 className="animate-spin" size={28} /><span>Preparando la actividad…</span></div>;
  }

  if (activityQuery.isError || !activity) {
    return (
      <div className="student-activity-state student-activity-state--error">
        <Gamepad2 size={30} />
        <h1>No pudimos abrir esta actividad</h1>
        <p>{activityQuery.error instanceof Error ? activityQuery.error.message : "Intenta nuevamente en unos segundos."}</p>
        <button type="button" onClick={() => activityQuery.refetch()}><RotateCcw size={17} /> Reintentar</button>
      </div>
    );
  }

  return (
    <main className="student-activity-page">
      <header className="student-activity-toolbar">
        <button type="button" onClick={handleGoBack}><ArrowLeft size={18} /> Volver al tema</button>
        <div className="student-activity-toolbar__meta">
          <span><Sparkles size={15} /> {activity.tipo_actividad?.nombre ?? "Actividad"}</span>
          {activity.limite_tiempo_seg ? <span><Timer size={15} /> {activity.limite_tiempo_seg} s</span> : null}
          <span className="student-activity-toolbar__xp"><Trophy size={15} /> {activity.xp_recompensa} XP</span>
        </div>
      </header>

      <section className="student-activity-stage">
        <ActividadWrapper actividad={activity} onComplete={handleComplete} />
      </section>

      {completionMutation.isPending ? (
        <div className="student-activity-sync" role="status"><Loader2 className="animate-spin" size={18} /><span>Guardando tu progreso…</span></div>
      ) : null}

      {resultadoOffline ? (
        <div className="student-activity-offline" role="status">
          <CloudOff size={20} />
          <div><strong>Progreso guardado en este dispositivo</strong><span>Lo sincronizaremos y sumaremos el XP cuando recuperes conexión.</span></div>
        </div>
      ) : null}

      {completed && !completionMutation.isPending ? (
        <button type="button" className="student-activity-return" onClick={handleGoBack}>Continuar con el tema</button>
      ) : null}
    </main>
  );
}
