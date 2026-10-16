import { AdminWidgetCard } from "../dashboard/admin-widget-card";
import { StatRow } from "../dashboard/stat-row";

export type ActivitySummaryStats = {
  total: number;
  publicadas: number;
  revision: number;
  borradores: number;
  archivadas: number;
  pubPct: number;
  revPct: number;
  borPct: number;
  arcPct: number;
};

export type AdminActivitiesSummaryProps = {
  stats: ActivitySummaryStats;
};

export function AdminActivitiesSummary({ stats }: AdminActivitiesSummaryProps) {
  return (
    <AdminWidgetCard title="Resumen de actividades" subtitle="Total de actividades">
      <div className="text-5xl font-black text-violet-600 mt-4 mb-5 select-none">{stats.total}</div>
      <div className="flex flex-col gap-4 text-xs font-semibold text-slate-600">
        <StatRow
          icon={<i className="fa-solid fa-check text-[10px]" />}
          iconBg="bg-emerald-100 text-emerald-600"
          label="Publicadas"
          value={stats.publicadas}
          percentage={stats.pubPct}
        />
        <StatRow
          icon={<i className="fa-solid fa-clock text-[10px]" />}
          iconBg="bg-orange-100 text-orange-600"
          label="En revisión"
          value={stats.revision}
          percentage={stats.revPct}
        />
        <StatRow
          icon={<i className="fa-solid fa-pencil text-[9px]" />}
          iconBg="bg-slate-100 text-slate-500"
          label="Borradores"
          value={stats.borradores}
          percentage={stats.borPct}
        />
        <StatRow
          icon={<i className="fa-solid fa-archive text-[10px]" />}
          iconBg="bg-violet-100 text-violet-600"
          label="Archivadas"
          value={stats.archivadas}
          percentage={stats.arcPct}
        />
      </div>
    </AdminWidgetCard>
  );
}
