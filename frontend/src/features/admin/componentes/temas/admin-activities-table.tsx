import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Paginacion } from "@/componentes/ui/paginacion";
import { EliminarActividadDialog } from "./eliminar-actividad-dialog";
import { MenuAccionesActividad } from "./activity-menu-actions";
import { BadgeEstado } from "@/componentes/ui/badge-estado";

export type ActivityTableRow = {
  id: string;
  titulo: string;
  consigna: string;
  tipoIcon: string;
  tipoIconColor: string;
  tipoBadgeBg: string;
  tipoNombre: string;
  tipoCodigo: string;
  temaId: string;
  temaNombre: string;
  temaSlug: string;
  temaEstado: string;
  pasoId: string | null;
  franjaEdad: string;
  xpText: string;
  xp: number;
  estado: string;
  fechaCreacion: string;
  dificultad: string;
  consignaRaw: string;
  opciones: unknown[];
  grupoEdadId: string;
  sendaColor: {
    bg: string;
    icon: string;
    text: string;
    nombre: string;
  };
};

export type AdminActivitiesTableProps = {
  activities: ActivityTableRow[];
  isLoading: boolean;
  totalResultados: number;
  paginaActual: number;
  onCambiarPagina: (pagina: number) => void;
  porPagina: number;
  onCambiarPorPagina: (n: number) => void;
  onActividadEliminada?: () => void;
};

export function AdminActivitiesTable({
  activities,
  isLoading,
  totalResultados,
  paginaActual,
  onCambiarPagina,
  porPagina,
  onCambiarPorPagina,
  onActividadEliminada,
}: AdminActivitiesTableProps) {
  const navigate = useNavigate();
  const [actividadAEliminar, setActividadAEliminar] = useState<ActivityTableRow | null>(null);

  return (
    <section className="activity-library-results">
      <div className="activity-library-results__header">
        <div><span>Resultados</span><h3>{totalResultados} actividades</h3></div>
        <p>Selecciona una actividad para revisar, editar o previsualizar.</p>
      </div>

      <div className="activity-library-results__list">
        {isLoading ? <div className="py-10 text-center text-sm font-semibold text-slate-500">Cargando actividades...</div> : null}
        {!isLoading && activities.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm font-semibold text-slate-500">No hay actividades creadas para este filtro.</div> : null}
        {!isLoading ? activities.map((actividad) => <ActivityCard key={actividad.id} actividad={actividad} navigate={navigate} onEliminar={() => setActividadAEliminar(actividad)} />) : null}
      </div>

      <Paginacion
        total={totalResultados}
        paginaActual={paginaActual}
        porPagina={porPagina}
        onCambiarPagina={onCambiarPagina}
        onCambiarPorPagina={onCambiarPorPagina}
        opcionesPorPagina={[10, 20, 50]}
        className="mt-6 pt-4 border-t border-slate-200"
      />

      {actividadAEliminar && (
        <EliminarActividadDialog
          actividad={actividadAEliminar}
          onClose={() => setActividadAEliminar(null)}
          onConfirm={() => {
            onActividadEliminada?.();
            setActividadAEliminar(null);
          }}
        />
      )}
    </section>
  );
}

function ActivityCard({ actividad, navigate, onEliminar }: { actividad: ActivityTableRow; navigate: ReturnType<typeof useNavigate>; onEliminar: () => void }) {
  return <article className="activity-library-card"><div className="activity-library-card__top"><div className={`activity-library-card__icon ${actividad.tipoBadgeBg}`}><i className={`fa-solid ${actividad.tipoIcon} ${actividad.tipoIconColor}`} aria-hidden="true" /></div><div className="activity-library-card__body"><h3>{actividad.titulo}</h3><p>{actividad.consigna}</p></div><MenuAccionesActividad navigate={navigate} act={actividad} onEliminar={onEliminar} /></div><div className="activity-library-card__meta"><span>{actividad.tipoNombre}</span><span>{actividad.franjaEdad}</span><span className="activity-library-card__xp">{actividad.xpText}</span><BadgeEstado estado={actividad.estado} /></div><footer>{actividad.temaNombre}<span>{actividad.fechaCreacion}</span></footer></article>;
}
