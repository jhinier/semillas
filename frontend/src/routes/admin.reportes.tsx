import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, CalendarDays, Download, Flame, Loader2, PieChart, ShieldCheck, TrendingUp, Users } from "lucide-react";

import { obtenerReportesAdmin } from "@/features/admin/admin.api";

export const Route = createFileRoute("/admin/reportes")({ component: AdminReportesPage });

const periodos = [
  { id: "7", label: "7 días" },
  { id: "30", label: "30 días" },
  { id: "90", label: "90 días" },
] as const;

function calcularRango(periodo: string) {
  const hoy = new Date();
  const dias = Number(periodo);
  const desde = new Date(hoy);
  desde.setDate(hoy.getDate() - (Number.isFinite(dias) ? dias - 1 : 29));
  return {
    desde: desde.toISOString().slice(0, 10),
    hasta: hoy.toISOString().slice(0, 10),
  };
}

function AdminReportesPage() {
  const [periodo, setPeriodo] = useState("30");
  const rango = useMemo(() => calcularRango(periodo), [periodo]);
  const query = useQuery({
    queryKey: ["admin", "reportes", rango.desde, rango.hasta],
    queryFn: () => obtenerReportesAdmin(rango),
  });

  const reporte = query.data;
  const actividadDiaria = reporte?.actividad_diaria ?? [];
  const temasDestacados = reporte?.temas_destacados ?? [];
  const roles = reporte?.distribucion_roles ?? {};
  const revisionEditorial = reporte?.revision_editorial;

  const maxEventos = useMemo(() => Math.max(...actividadDiaria.map((item) => item.eventos), 1), [actividadDiaria]);

  return (
    <div className="admin-dashboard">
      <section className="admin-dashboard__intro">
        <div>
          <span className="admin-eyebrow">Análisis editorial</span>
          <h2>Reportes</h2>
          <p>Consulta métricas de contenido, revisión y actividad del equipo.</p>
        </div>
        <div className="admin-dashboard__intro-actions">
          <select value={periodo} onChange={(event) => setPeriodo(event.target.value)} className="admin-secondary-button min-w-36">
            {periodos.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
          <button type="button" className="admin-primary-button">
            <Download size={17} /> Exportar CSV
          </button>
        </div>
      </section>

      {query.isLoading ? (
        <div className="admin-dashboard-state">
          <span><Loader2 className="animate-spin" /></span>
          <h2>Cargando reportes</h2>
          <p>Calculando métricas reales de la plataforma.</p>
        </div>
      ) : query.isError || !reporte ? (
        <div className="admin-dashboard-state">
          <span><ShieldCheck /></span>
          <h2>No se pudieron cargar los reportes</h2>
          <p>Vuelve a intentar la consulta.</p>
        </div>
      ) : (
        <>
          <section className="admin-metrics-grid">
            <MetricCard icon={<Users size={22} />} label="Usuarios activos" value={reporte.metricas.usuarios_activos} detail="Cuentas con acceso habilitado" />
            <MetricCard icon={<TrendingUp size={22} />} label="Usuarios nuevos" value={reporte.metricas.usuarios_nuevos} detail="Ingresos del rango" />
            <MetricCard icon={<BarChart3 size={22} />} label="Temas publicados" value={reporte.metricas.temas_publicados} detail="Contenido listo para jugar" />
            <MetricCard icon={<Flame size={22} />} label="XP otorgada" value={reporte.metricas.xp_otorgada} detail="Puntos generados por actividad" />
            <MetricCard icon={<ShieldCheck size={22} />} label="Precisión" value={Math.round(reporte.metricas.precision_respuestas)} detail="Respuestas correctas %" />
            <MetricCard icon={<PieChart size={22} />} label="Clubes activos" value={reporte.metricas.clubes_activos} detail="Comunidades con movimiento" />
          </section>

          <div className="admin-dashboard__grid">
            <div className="admin-dashboard__main-column">
              <section className="admin-panel-card">
                <PanelHeader title="Actividad diaria" description={`Rango ${reporte.rango.desde} → ${reporte.rango.hasta}`} />
                <div className="admin-week-chart" aria-label="Actividad por día">
                  {actividadDiaria.map((item) => (
                    <div key={item.fecha} className="admin-week-chart__item">
                      <span>{item.eventos}</span>
                      <div>
                        <i style={{ height: `${Math.max((item.eventos / maxEventos) * 100, item.eventos ? 12 : 3)}%` }} />
                      </div>
                      <small>{item.fecha.slice(5)}</small>
                    </div>
                  ))}
                </div>
              </section>

              <section className="admin-panel-card">
                <PanelHeader title="Temas destacados" description="Temas con más actividad dentro del rango." />
                <div className="admin-recent-list">
                  {temasDestacados.map((tema) => (
                    <div key={tema.id} className="admin-recent-row">
                      <span className="admin-recent-row__icon"><CalendarDays size={18} /></span>
                      <div>
                        <strong>{tema.titulo}</strong>
                        <small>{tema.usuarios} usuarios · {tema.completados} completados</small>
                      </div>
                      <span className="admin-state-pill bg-slate-100 text-slate-600">{tema.eventos} eventos</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="admin-dashboard__side-column">
              <section className="admin-panel-card admin-panel-card--sticky">
                <PanelHeader title="Editorial" description="Resumen del flujo de revisión." />
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>Total revisiones: {revisionEditorial?.total.toLocaleString("es-EC") ?? 0}</li>
                  <li>Tiempo promedio: {revisionEditorial ? `${revisionEditorial.tiempo_promedio_horas.toFixed(1)} h` : "0 h"}</li>
                  {Object.entries(revisionEditorial?.por_estado ?? {}).map(([estado, cantidad]) => (
                    <li key={estado}>{estado}: {cantidad.toLocaleString("es-EC")}</li>
                  ))}
                </ul>
              </section>

              <section className="admin-panel-card">
                <PanelHeader title="Distribución de roles" description="Usuarios agrupados por rol." />
                <div className="admin-review-list">
                  {Object.entries(roles).map(([rol, cantidad]) => (
                    <div key={rol} className="admin-review-item">
                      <span><ShieldCheck size={17} /></span>
                      <div>
                        <strong>{rol}</strong>
                        <small>Usuarios con ese rol</small>
                      </div>
                      <time>{cantidad.toLocaleString("es-EC")}</time>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>

          {reporte.muestra_limitada ? (
            <div className="admin-dashboard-state mt-6">
              <span><ShieldCheck /></span>
              <h2>Vista resumida</h2>
              <p>El backend devolvió una muestra limitada para proteger el rendimiento.</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, detail }: { icon: ReactNode; label: string; value: number; detail: string; }) {
  return (
    <article className="admin-metric-card">
      <span className="admin-metric-card__icon admin-tone--violet">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value.toLocaleString("es-EC")}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function PanelHeader({ title, description }: { title: string; description: string }) {
  return <header className="admin-panel-header"><div><h3>{title}</h3><p>{description}</p></div></header>;
}
