import type { ComponentType } from "react";

type MetricCardProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  helper?: string;
  accent: string;
};

export function MetricCard({ icon: Icon, label, value, helper, accent }: MetricCardProps) {
  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className={`mb-3 inline-flex rounded-2xl bg-slate-50 p-2 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-800">{value}</p>
      {helper ? <p className="mt-1 text-xs font-bold text-slate-400">{helper}</p> : null}
    </article>
  );
}
