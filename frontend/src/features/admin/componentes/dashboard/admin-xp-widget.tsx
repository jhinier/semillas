import { AdminWidgetCard } from "./admin-widget-card";

export function AdminXpWidget() {
  return (
    <AdminWidgetCard
      title="XP promedio por actividad"
      badge={
        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-600">
          +18 XP
        </span>
      }
      padding="sm"
    >
      <p className="text-[11px] text-slate-400 mt-1">Sigue creando actividades que motiven y desafíen a los niños.</p>

      <div className="flex items-end justify-end gap-1.5 h-10 mt-4 select-none pr-2">
        <div className="w-2.5 bg-slate-100 rounded-sm h-[35%]" />
        <div className="w-2.5 bg-slate-100 rounded-sm h-[60%]" />
        <div className="w-2.5 bg-[#2a4a3a] rounded-sm h-[45%]" />
        <div className="w-2.5 bg-slate-100 rounded-sm h-[80%]" />
        <div className="w-2.5 bg-[#2a4a3a] rounded-sm h-[100%]" />
      </div>
    </AdminWidgetCard>
  );
}
