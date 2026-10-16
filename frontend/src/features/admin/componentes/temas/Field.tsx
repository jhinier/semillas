type FieldProps = {
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
};

export function Field({
  label,
  required = false,
  help,
  children,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-700">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      {children}
      {help ? <span className="text-[10px] text-slate-400 font-bold">{help}</span> : null}
    </div>
  );
}
