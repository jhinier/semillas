import { FilaListaCompacta } from "@/componentes/ui/fila-lista-compacta";
import { Boton } from "@/componentes/ui/boton";
import { AdminWidgetCard } from "../dashboard/admin-widget-card";

type SummaryCounts = {
  total: number;
  publicados: number;
  revision: number;
  borradores: number;
  archivados: number;
};

type AdminThemesSummaryProps = {
  counts: SummaryCounts;
  onVerReportes?: () => void;
};

export function AdminThemesSummary({ counts, onVerReportes }: AdminThemesSummaryProps) {
  const getPercentage = (val: number) => {
    if (counts.total === 0) return 0;
    return Math.round((val / counts.total) * 100);
  };

  const items = [
    {
      label: "Publicados",
      count: counts.publicados,
      percentage: getPercentage(counts.publicados),
      icon: "fa-circle-check",
      iconColor: "text-green-600",
      iconBg: "bg-emerald-900/30",
    },
    {
      label: "En revisión",
      count: counts.revision,
      percentage: getPercentage(counts.revision),
      icon: "fa-clock",
      iconColor: "text-violet-600",
      iconBg: "bg-violet-900/30",
    },
    {
      label: "Borradores",
      count: counts.borradores,
      percentage: getPercentage(counts.borradores),
      icon: "fa-pen-to-square",
      iconColor: "text-amber-500",
      iconBg: "bg-amber-900/30",
    },
    {
      label: "Archivados",
      count: counts.archivados,
      percentage: getPercentage(counts.archivados),
      icon: "fa-box-archive",
      iconColor: "text-emerald-400/50",
      iconBg: "bg-[#1a3a2a]",
    },
  ];

  return (
    <AdminWidgetCard title="Resumen por estado" subtitle="Total de temas">
      <div className="text-5xl font-black text-violet-600 my-4 leading-none select-none">
        {counts.total}
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {items.map((item) => (
          <FilaListaCompacta
            key={item.label}
            izquierda={
              <span className={`w-8 h-8 rounded-full flex items-center justify-center ${item.iconBg} ${item.iconColor}`}>
                <i className={`fa-solid ${item.icon} text-sm`} />
              </span>
            }
            titulo={item.label}
            derecha={
              <div className="flex items-center gap-4 text-xs font-extrabold text-emerald-50 sm:text-sm">
                <span>{item.count}</span>
                <span className="text-emerald-400/50 font-semibold text-xs w-8 text-right">{item.percentage}%</span>
              </div>
            }
            className="rounded-none border-0 bg-transparent p-0 pb-3 last:pb-0"
            izquierdaClassName="self-start"
            contenidoClassName="self-center"
            derechaClassName="self-center"
          />
        ))}
      </div>

      {onVerReportes && (
        <Boton
          type="button"
          onClick={onVerReportes}
          className="mt-6 flex items-center justify-between w-full rounded-2xl bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 py-3 px-4 text-xs font-bold transition-all border border-transparent shadow-xs cursor-pointer"
          variante="texto"
        >
          <span>Ver reportes de temas</span>
          <i className="fa-solid fa-chevron-right text-[10px]" />
        </Boton>
      )}
    </AdminWidgetCard>
  );
}
