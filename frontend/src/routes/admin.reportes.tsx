import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, BookOpenCheck, CalendarDays, Download, Flame, Loader2, PieChart, ShieldCheck, TrendingUp, Users } from "lucide-react";
import type { ReportesAdmin } from "@/features/admin/admin.api";

import { obtenerReportesAdmin } from "@/features/admin/admin.api";

export const Route = createFileRoute("/admin/reportes")({
  component: AdminReportesPage,
  errorComponent: AdminReportesError,
});

function AdminReportesError({ reset }: { reset: () => void }) {
  return (
    <div className="admin-dashboard-state">
      <span><ShieldCheck size={36} /></span>
      <h2>No se pudieron cargar los reportes</h2>
      <p>Ocurrió un inconveniente al calcular los datos de analítica.</p>
      <button
        type="button"
        className="admin-primary-button mt-4 cursor-pointer"
        onClick={() => reset()}
      >
        Reintentar consulta
      </button>
    </div>
  );
}

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

const estadoMeta: Record<string, { label: string; className: string }> = {
  borrador: { label: "Borradores", className: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" },
  revision: { label: "En revisión", className: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300" },
  aprobado: { label: "Aprobados", className: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" },
  publicado: { label: "Publicados", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" },
  archivado: { label: "Archivados", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
};

const rolMeta: Record<string, { label: string; desc: string; icon: typeof Users }> = {
  administrador: { label: "Administrador", desc: "Gestión completa y autoría", icon: ShieldCheck },
  padre: { label: "Padre / Tutor", desc: "Monitoreo y acompañamiento", icon: Users },
  usuario: { label: "Estudiante", desc: "Participante activo en lecciones", icon: BookOpenCheck },
};

function exportarReportesCSV(reporte: ReportesAdmin, rango: { desde: string; hasta: string }) {
  const anyRep = reporte as unknown as Record<string, unknown>;
  const desde = reporte.rango?.desde ?? (typeof anyRep.desde === "string" ? anyRep.desde : rango.desde);
  const hasta = reporte.rango?.hasta ?? (typeof anyRep.hasta === "string" ? anyRep.hasta : rango.hasta);

  const m = {
    usuarios_activos: reporte.metricas?.usuarios_activos ?? (typeof anyRep.usuarios_activos === "number" ? anyRep.usuarios_activos : 0),
    usuarios_nuevos: reporte.metricas?.usuarios_nuevos ?? (typeof anyRep.usuarios_nuevos === "number" ? anyRep.usuarios_nuevos : 0),
    temas_publicados: reporte.metricas?.temas_publicados ?? (typeof anyRep.temas_publicados === "number" ? anyRep.temas_publicados : 0),
    temas_completados: reporte.metricas?.temas_completados ?? (typeof anyRep.temas_completados === "number" ? anyRep.temas_completados : 0),
    actividades_completadas: reporte.metricas?.actividades_completadas ?? (typeof anyRep.actividades_completadas === "number" ? anyRep.actividades_completadas : 0),
    xp_otorgada: reporte.metricas?.xp_otorgada ?? (typeof anyRep.xp_otorgada === "number" ? anyRep.xp_otorgada : 0),
    precision_respuestas: reporte.metricas?.precision_respuestas ?? (typeof anyRep.precision_respuestas === "number" ? anyRep.precision_respuestas : 0),
    clubes_activos: reporte.metricas?.clubes_activos ?? (typeof anyRep.clubes_activos === "number" ? anyRep.clubes_activos : 0),
  };

  const lineas: string[] = [];
  lineas.push("Reporte de Administración - Semillas");
  lineas.push(`Rango:;${desde} a ${hasta}`);
  lineas.push(`Generado:;${new Date().toLocaleString("es-EC")}`);
  lineas.push("");
  lineas.push("Métricas Generales");
  lineas.push("Métrica;Valor");
  lineas.push(`Usuarios activos;${m.usuarios_activos}`);
  lineas.push(`Usuarios nuevos;${m.usuarios_nuevos}`);
  lineas.push(`Temas publicados;${m.temas_publicados}`);
  lineas.push(`Temas completados;${m.temas_completados}`);
  lineas.push(`Actividades completadas;${m.actividades_completadas}`);
  lineas.push(`XP total otorgada;${m.xp_otorgada}`);
  lineas.push(`Precisión de respuestas;${Math.round(m.precision_respuestas)}%`);
  lineas.push(`Clubes activos;${m.clubes_activos}`);
  lineas.push("");
  lineas.push("Actividad Diaria");
  lineas.push("Fecha;Eventos;Usuarios Activos;XP");
  for (const dia of reporte.actividad_diaria ?? []) {
    lineas.push(`${dia.fecha};${dia.eventos};${dia.usuarios};${dia.xp}`);
  }
  lineas.push("");
  lineas.push("Temas Destacados");
  lineas.push("Título;Eventos;Completados;Usuarios");
  for (const tema of reporte.temas_destacados ?? []) {
    lineas.push(`"${(tema.titulo || "").replace(/"/g, '""')}";${tema.eventos};${tema.completados};${tema.usuarios}`);
  }
  lineas.push("");
  lineas.push("Distribución de Roles");
  lineas.push("Rol;Cantidad");
  for (const [rol, cant] of Object.entries(reporte.distribucion_roles ?? {})) {
    lineas.push(`${rol};${cant}`);
  }
  lineas.push("");
  lineas.push("Resumen Editorial");
  lineas.push("Estado;Cantidad");
  lineas.push(`Total revisiones;${reporte.revision_editorial?.total ?? 0}`);
  lineas.push(`Tiempo promedio (horas);${Number(reporte.revision_editorial?.tiempo_promedio_horas ?? 0).toFixed(1)}`);
  for (const [estado, cant] of Object.entries(reporte.revision_editorial?.por_estado ?? {})) {
    lineas.push(`${estado};${cant}`);
  }

  const contenido = "\uFEFF" + lineas.join("\r\n");
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `reporte-semillas-${desde}-${hasta}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function AdminReportesPage() {
  const [periodo, setPeriodo] = useState("30");
  const rango = useMemo(() => calcularRango(periodo), [periodo]);
  const query = useQuery({
    queryKey: ["admin", "reportes", rango.desde, rango.hasta],
    queryFn: () => obtenerReportesAdmin(rango),
  });

  const reporte = query.data;

  const anyReporte = reporte as unknown as Record<string, unknown> | undefined;

  const rangoNormalizado = useMemo(() => ({
    desde: reporte?.rango?.desde ?? (typeof anyReporte?.desde === "string" ? anyReporte.desde : rango.desde),
    hasta: reporte?.rango?.hasta ?? (typeof anyReporte?.hasta === "string" ? anyReporte.hasta : rango.hasta),
  }), [reporte, anyReporte, rango]);

  const metricas = useMemo(() => ({
    usuarios_activos: reporte?.metricas?.usuarios_activos ?? (typeof anyReporte?.usuarios_activos === "number" ? anyReporte.usuarios_activos : 0),
    usuarios_nuevos: reporte?.metricas?.usuarios_nuevos ?? (typeof anyReporte?.usuarios_nuevos === "number" ? anyReporte.usuarios_nuevos : 0),
    temas_publicados: reporte?.metricas?.temas_publicados ?? (typeof anyReporte?.temas_publicados === "number" ? anyReporte.temas_publicados : 0),
    temas_completados: reporte?.metricas?.temas_completados ?? (typeof anyReporte?.temas_completados === "number" ? anyReporte.temas_completados : 0),
    actividades_completadas: reporte?.metricas?.actividades_completadas ?? (typeof anyReporte?.actividades_completadas === "number" ? anyReporte.actividades_completadas : 0),
    xp_otorgada: reporte?.metricas?.xp_otorgada ?? (typeof anyReporte?.xp_otorgada === "number" ? anyReporte.xp_otorgada : 0),
    precision_respuestas: reporte?.metricas?.precision_respuestas ?? (typeof anyReporte?.precision_respuestas === "number" ? anyReporte.precision_respuestas : 0),
    clubes_activos: reporte?.metricas?.clubes_activos ?? (typeof anyReporte?.clubes_activos === "number" ? anyReporte.clubes_activos : 0),
  }), [reporte, anyReporte]);

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
        <div className="admin-dashboard__intro-actions flex items-center gap-3">
          <select
            value={periodo}
            onChange={(event) => setPeriodo(event.target.value)}
            className="admin-secondary-button cursor-pointer px-4 text-xs font-bold min-w-[155px]"
            aria-label="Periodo de tiempo"
          >
            {periodos.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
          <button
            type="button"
            className="admin-primary-button cursor-pointer whitespace-nowrap"
            onClick={() => reporte && exportarReportesCSV(reporte, rango)}
            disabled={!reporte || query.isLoading}
            title="Descargar reporte en formato CSV"
          >
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
            <MetricCard icon={<Users size={22} />} label="Usuarios activos" value={metricas.usuarios_activos} detail="Cuentas con acceso habilitado" />
            <MetricCard icon={<TrendingUp size={22} />} label="Usuarios nuevos" value={metricas.usuarios_nuevos} detail="Ingresos del rango" />
            <MetricCard icon={<BarChart3 size={22} />} label="Temas publicados" value={metricas.temas_publicados} detail="Contenido listo para jugar" />
            <MetricCard icon={<Flame size={22} />} label="XP otorgada" value={metricas.xp_otorgada} detail="Puntos generados por actividad" />
            <MetricCard icon={<ShieldCheck size={22} />} label="Precisión" value={Math.round(metricas.precision_respuestas)} detail="Respuestas correctas %" />
            <MetricCard icon={<PieChart size={22} />} label="Clubes activos" value={metricas.clubes_activos} detail="Comunidades con movimiento" />
          </section>

          <div className="admin-dashboard__grid">
            <div className="admin-dashboard__main-column">
              <section className="admin-panel-card">
                <PanelHeader title="Actividad diaria" description={`Rango ${rangoNormalizado.desde} → ${rangoNormalizado.hasta}`} />
                <div className="admin-week-chart" aria-label="Actividad por día">
                  {actividadDiaria.map((item) => (
                    <div key={item.fecha} className="admin-week-chart__item">
                      <span>{item.eventos ?? 0}</span>
                      <div>
                        <i style={{ height: `${Math.max(((item.eventos ?? 0) / maxEventos) * 100, item.eventos ? 12 : 3)}%` }} />
                      </div>
                      <small>{item.fecha ? item.fecha.slice(5) : ""}</small>
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
                        <strong>{tema.titulo || "Tema sin título"}</strong>
                        <small>{tema.usuarios ?? 0} usuarios · {tema.completados ?? 0} completados</small>
                      </div>
                      <span className="admin-state-pill bg-[var(--admin-bg-muted)] text-[var(--admin-text-body)]">{tema.eventos ?? 0} eventos</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="admin-dashboard__side-column">
              <section className="admin-panel-card admin-panel-card--sticky">
                <PanelHeader title="Editorial" description="Resumen del flujo de revisión." />

                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  <div className="rounded-xl border border-[var(--admin-border-default)] bg-[var(--admin-bg-muted)] p-3 text-center">
                    <small className="block text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-muted)]">Total</small>
                    <strong className="mt-1 block text-lg font-black text-[var(--admin-text-heading)]">
                      {(revisionEditorial?.total ?? 0).toLocaleString("es-EC")}
                    </strong>
                    <span className="text-[10px] text-[var(--admin-text-muted)]">revisiones</span>
                  </div>
                  <div className="rounded-xl border border-[var(--admin-border-default)] bg-[var(--admin-bg-muted)] p-3 text-center">
                    <small className="block text-[11px] font-bold uppercase tracking-wider text-[var(--admin-text-muted)]">Promedio</small>
                    <strong className="mt-1 block text-lg font-black text-[var(--admin-text-heading)]">
                      {`${Number(revisionEditorial?.tiempo_promedio_horas ?? 0).toFixed(1)} h`}
                    </strong>
                    <span className="text-[10px] text-[var(--admin-text-muted)]">respuesta</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {Object.entries(revisionEditorial?.por_estado ?? {}).map(([estado, cantidad]) => {
                    const meta = estadoMeta[estado] ?? { label: estado, className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" };
                    return (
                      <div key={estado} className="flex items-center justify-between rounded-xl border border-[var(--admin-border-default)] bg-[var(--admin-bg-surface)] p-2.5 px-3">
                        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-extrabold ${meta.className}`}>
                          {meta.label}
                        </span>
                        <strong className="text-sm font-black text-[var(--admin-text-heading)]">
                          {(cantidad ?? 0).toLocaleString("es-EC")}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="admin-panel-card">
                <PanelHeader title="Distribución de roles" description="Usuarios agrupados por rol." />
                <div className="admin-review-list">
                  {Object.entries(roles).map(([rol, cantidad]) => {
                    const metaRol = rolMeta[rol] ?? { label: rol, desc: "Usuarios con ese rol", icon: Users };
                    const IconRol = metaRol.icon;
                    return (
                      <div key={rol} className="admin-review-item">
                        <span><IconRol size={17} /></span>
                        <div>
                          <strong>{metaRol.label}</strong>
                          <small>{metaRol.desc}</small>
                        </div>
                        <time>{(cantidad ?? 0).toLocaleString("es-EC")}</time>
                      </div>
                    );
                  })}
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
        <strong>{(value ?? 0).toLocaleString("es-EC")}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function PanelHeader({ title, description }: { title: string; description: string }) {
  return <header className="admin-panel-header"><div><h3>{title}</h3><p>{description}</p></div></header>;
}
