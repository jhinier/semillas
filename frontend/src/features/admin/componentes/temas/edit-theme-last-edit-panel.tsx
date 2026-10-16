interface EditThemeLastEditPanelProps {
  nombreVisible?: string | null;
  actualizadoEn?: string | null;
}

export function EditThemeLastEditPanel({ nombreVisible, actualizadoEn }: EditThemeLastEditPanelProps) {
  const formattedDate = actualizadoEn
    ? new Date(actualizadoEn).toLocaleDateString("es-EC", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col gap-2.5 text-[11px] font-bold text-slate-600 text-left select-none">
      <h3 className="font-extrabold text-slate-800 text-sm mb-1.5">Última edición</h3>
      <div className="flex justify-between items-center">
        <span className="text-slate-400 font-bold">Por:</span>
        <span className="text-slate-700 font-extrabold">{nombreVisible ?? "—"}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-slate-400 font-bold">Fecha:</span>
        <span className="text-slate-700 font-extrabold">{formattedDate}</span>
      </div>
    </div>
  );
}
