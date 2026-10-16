type ItemProps = {
  label: string;
  value: string;
};

export function Item({ label, value }: ItemProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
      <dt className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</dt>
      <dd className="mt-1 break-words font-bold text-slate-700">{value}</dd>
    </div>
  );
}
