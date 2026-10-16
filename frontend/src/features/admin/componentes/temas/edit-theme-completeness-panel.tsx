interface CompletenessItem {
  label: string;
  done: boolean;
}

interface EditThemeCompletenessPanelProps {
  items: CompletenessItem[];
  percentage: number;
}

export function EditThemeCompletenessPanel({ items, percentage }: EditThemeCompletenessPanelProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col text-left">
      <h3 className="font-extrabold text-slate-800 text-sm select-none">Progreso de completitud</h3>
      <div className="flex items-center justify-between mt-3 mb-2 font-bold text-xs select-none">
        <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden mr-3">
          <div className="bg-green-600 h-full rounded-full" style={{ width: `${percentage}%` }} />
        </div>
        <span className="text-slate-700 font-black">{percentage}%</span>
      </div>
      <p className="text-[10.5px] text-slate-400 font-semibold leading-relaxed mb-4 select-none">
        {percentage === 100
          ? "El tema está completo y listo para publicar."
          : percentage >= 75
          ? "Excelente trabajo. Solo faltan algunos detalles para completar tu tema."
          : "Completa más secciones para que el tema esté listo."}
      </p>
      <div className="flex flex-col gap-3 text-xs font-bold text-slate-600">
        {items.map((item) => (
          <div key={item.label} className={`flex items-center gap-2.5 ${item.done ? "" : "text-slate-400"}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-white text-[8px] shadow-xs ${item.done ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-300"}`}>
              <i className={`fa-solid ${item.done ? "fa-check" : "fa-circle"}`} />
            </div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
