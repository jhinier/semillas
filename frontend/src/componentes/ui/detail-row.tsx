type Props = {
  label: string;
  value: string;
  className?: string;
  noBorder?: boolean;
};

export function DetailRow({ label, value, className = "", noBorder = false }: Props) {
  return (
    <div
      className={`flex items-center justify-between text-xs font-semibold py-3 select-none ${noBorder ? "" : "border-b border-slate-50"} ${className}`}
    >
      <span className="text-slate-400">{label}:</span>
      <span className="font-extrabold text-slate-800">{value}</span>
    </div>
  );
}
