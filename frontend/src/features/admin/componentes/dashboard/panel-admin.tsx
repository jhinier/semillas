import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FilePenLine,
  FolderArchive,
  Gamepad2,
  LayoutDashboard,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Users,
  UsersRound,
} from "lucide-react";
import { obtenerResumenAdminDetallado } from "@/features/admin/admin.api";

const estadoMeta: Record<string, { label: string; className: string }> = {
  borrador: { label: "Borradores", className: "bg-amber-50 text-amber-700" },
  revision: { label: "En revisión", className: "bg-violet-50 text-violet-700" },
  aprobado: { label: "Aprobados", className: "bg-blue-50 text-blue-700" },
  publicado: { label: "Publicados", className: "bg-emerald-50 text-emerald-700" },
  archivado: { label: "Archivados", className: "bg-slate-100 text-slate-600" },
};

const accionLabels: Record<string, string> = {
  publicar: "Publicó un tema",
  duplicar: "Duplicó un tema",
  enviar_revision: "Envió un tema a revisión",
  revision_aprobado: "Aprobó una revisión",
  revision_cambios_solicitados: "Solicitó cambios",
  crear: "Creó contenido",
  actualizar: "Actualizó contenido",
};

export function PanelAdministracion() {
  const resumenQuery = useQuery({
    queryKey: ["admin", "dashboard", "detallado"],
    queryFn: obtenerResumenAdminDetallado,
    refetchInterval: 60_000,
  });

  const metricas = useMemo(() => {
    const d = resumenQuery.data;
    if (!d) return [];
    return [
      { label: "Temas", value: d.metricas.temas, detail: `${d.metricas.publicados} publicados`, icon: BookOpenCheck, tone: "emerald" },
      { label: "Usuarios activos", value: d.metricas.usuarios_activos, detail: "Cuentas habilitadas", icon: Users, tone: "blue" },
      { label: "Actividades", value: d.metricas.actividades, detail: "Experiencias creadas", icon: Gamepad2, tone: "amber" },
      { label: "Clubes activos", value: d.metricas.clubes_activos, detail: "Comunidades aprendiendo", icon: UsersRound, tone: "violet" },
    ] as const;
  }, [resumenQuery.data?.metricas.temas, resumenQuery.data?.metricas.publicados, resumenQuery.data?.metricas.usuarios_activos, resumenQuery.data?.metricas.actividades, resumenQuery.data?.metricas.clubes_activos]);

  const maxSemana = useMemo(() => {
    const d = resumenQuery.data;
    if (!d) return 1;
    return Math.max(...d.publicaciones_semana.map((item) => item.total), 1);
  }, [resumenQuery.data?.publicaciones_semana]);

  if (resumenQuery.isLoading) {
    return <DashboardState icon={<Loader2 className="animate-spin" />} title="Cargando panel" description="Consultando métricas reales de la plataforma." />;
  }

  if (resumenQuery.isError || !resumenQuery.data) {
    return (
      <DashboardState
        icon={<LayoutDashboard />}
        title="No se pudo cargar el panel"
        description="Comprueba la conexión con el backend y vuelve a intentarlo."
        action={<button type="button" onClick={() => resumenQuery.refetch()} className="admin-primary-button"><RefreshCw size={17} /> Reintentar</button>}
      />
    );
  }

  const data = resumenQuery.data;

  return (
    <div className="admin-dashboard">
      <section className="admin-dashboard__intro">
        <div>
          <span className="admin-eyebrow">Centro editorial</span>
          <h2>Todo lo importante, sin datos simulados</h2>
          <p>Supervisa contenido, revisiones y actividad desde un único panel conectado al backend.</p>
        </div>
        <div className="admin-dashboard__intro-actions">
          <Link to="/admin/temas/new" className="admin-primary-button"><Plus size={18} /> Crear tema</Link>
          <Link to="/admin/revision" className="admin-secondary-button"><ShieldCheck size={18} /> Revisar pendientes <span>{data.metricas.pendientes_revision}</span></Link>
        </div>
      </section>

      <section className="admin-metrics-grid" aria-label="Métricas principales">
        {metricas.map((metrica) => {
          const Icon = metrica.icon;
          return (
            <article key={metrica.label} className="admin-metric-card">
              <span className={`admin-metric-card__icon admin-tone--${metrica.tone}`}><Icon size={22} /></span>
              <div><span>{metrica.label}</span><strong>{metrica.value.toLocaleString("es-EC")}</strong><small>{metrica.detail}</small></div>
            </article>
          );
        })}
      </section>

      <div className="admin-dashboard__grid">
        <div className="admin-dashboard__main-column">
          <section className="admin-panel-card">
            <PanelHeader title="Estado editorial" description="Distribución actual de todos los temas." action={<Link to="/admin/temas">Gestionar temas <ArrowRight size={16} /></Link>} />
            <div className="admin-status-grid">
              {Object.entries(estadoMeta).map(([estado, meta]) => (
                <Link key={estado} to="/admin/temas" search={{ estado } as any} className="admin-status-card">
                  <span className={meta.className}>{estado === "publicado" ? <CheckCircle2 /> : estado === "archivado" ? <FolderArchive /> : estado === "revision" ? <Clock3 /> : <CircleDashed />}</span>
                  <strong>{data.estados[estado] ?? 0}</strong>
                  <p>{meta.label}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="admin-panel-card">
            <PanelHeader title="Temas recientes" description="Últimas lecciones modificadas por el equipo." action={<Link to="/admin/temas">Ver biblioteca <ArrowRight size={16} /></Link>} />
            <div className="admin-recent-list">
              {data.temas_recientes.length === 0 ? <EmptyInline text="Todavía no hay temas." /> : data.temas_recientes.map((tema) => (
                <Link key={tema.id} to="/admin/temas/$themeId/detalle" params={{ themeId: tema.id }} className="admin-recent-row">
                  <span className="admin-recent-row__icon"><BookOpenCheck size={18} /></span>
                  <div><strong>{tema.titulo}</strong><small>{tema.senda} · {tema.autor}</small></div>
                  <span className={`admin-state-pill ${estadoMeta[tema.estado]?.className ?? "bg-slate-100 text-slate-600"}`}>{estadoMeta[tema.estado]?.label ?? tema.estado}</span>
                  <time>{formatRelative(tema.actualizado_en)}</time>
                  <ArrowRight size={17} />
                </Link>
              ))}
            </div>
          </section>

          <section className="admin-panel-card">
            <PanelHeader title="Publicaciones de los últimos 7 días" description="Temas publicados por día, calculados desde el historial real." />
            <div className="admin-week-chart" aria-label="Publicaciones por día">
              {data.publicaciones_semana.map((item) => (
                <div key={item.fecha} className="admin-week-chart__item">
                  <span>{item.total}</span>
                  <div><i style={{ height: `${Math.max((item.total / maxSemana) * 100, item.total ? 12 : 3)}%` }} /></div>
                  <small>{item.etiqueta.replace(".", "")}</small>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="admin-dashboard__side-column">
          <section className="admin-panel-card admin-panel-card--sticky">
            <PanelHeader title="Cola de revisión" description="Contenido que necesita una decisión editorial." action={<Link to="/admin/revision">Ver todo</Link>} />
            <div className="admin-review-list">
              {data.revisiones.length === 0 ? <EmptyInline text="No hay revisiones pendientes." /> : data.revisiones.slice(0, 5).map((revision) => (
                <Link key={revision.id} to="/admin/temas/$themeId/detalle" params={{ themeId: revision.tema_id }} className="admin-review-item">
                  <span><Clock3 size={17} /></span>
                  <div><strong>{revision.titulo}</strong><small>{revision.senda} · {revision.enviado_por}</small></div>
                  <time>{formatRelative(revision.creado_en)}</time>
                </Link>
              ))}
            </div>
          </section>

          <section className="admin-panel-card">
            <PanelHeader title="Actividad del equipo" description="Eventos administrativos registrados." />
            <div className="admin-activity-list">
              {data.actividad_reciente.length === 0 ? <EmptyInline text="Aún no hay eventos de auditoría." /> : data.actividad_reciente.slice(0, 7).map((evento) => (
                <div key={evento.id} className="admin-activity-item">
                  <span><Activity size={16} /></span>
                  <div><strong>{evento.actor}</strong><p>{accionLabels[evento.accion] ?? evento.accion.replaceAll("_", " ")}</p><time>{formatRelative(evento.creado_en)}</time></div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-quick-card">
            <span><FilePenLine size={23} /></span>
            <h3>Continúa editando</h3>
            <p>La biblioteca de temas concentra metadatos, recorrido CRECER, actividades, medios y publicación.</p>
            <Link to="/admin/temas">Abrir estudio de contenido <ArrowRight size={17} /></Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

function PanelHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <header className="admin-panel-header"><div><h3>{title}</h3><p>{description}</p></div>{action ? <div className="admin-panel-header__action">{action}</div> : null}</header>;
}

function DashboardState({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }) {
  return <div className="admin-dashboard-state"><span>{icon}</span><h2>{title}</h2><p>{description}</p>{action}</div>;
}

function EmptyInline({ text }: { text: string }) { return <p className="admin-empty-inline">{text}</p>; }

function formatRelative(value: string | null) {
  if (!value) return "Sin fecha";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60_000));
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
}
