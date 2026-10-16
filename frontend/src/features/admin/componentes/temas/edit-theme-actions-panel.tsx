import { Loader } from "lucide-react";

interface EditThemeActionsPanelProps {
  onSave: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  isSavePending: boolean;
  isDuplicatePending: boolean;
  isArchivePending: boolean;
}

export function EditThemeActionsPanel({
  onSave,
  onDuplicate,
  onArchive,
  isSavePending,
  isDuplicatePending,
  isArchivePending,
}: EditThemeActionsPanelProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col gap-3 text-left">
      <h3 className="font-extrabold text-slate-800 text-sm mb-2 border-b border-slate-50 pb-2.5 select-none">Acciones</h3>
      <button
        onClick={onSave}
        disabled={isSavePending}
        className="w-full bg-green-brote hover:opacity-95 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
      >
        {isSavePending ? <Loader className="animate-spin" size={12} /> : <i className="fa-solid fa-circle-check text-[10px]" />}
        <span>Guardar cambios</span>
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        disabled={isDuplicatePending}
        className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-violet-600 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
      >
        {isDuplicatePending ? <Loader className="animate-spin" size={12} /> : <i className="fa-regular fa-clone text-[10px]" />} Duplicar tema
      </button>
      <button
        type="button"
        onClick={onArchive}
        disabled={isArchivePending}
        className="w-full bg-white hover:bg-red-50 border border-red-200 text-red-600 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
      >
        {isArchivePending ? <Loader className="animate-spin" size={12} /> : <i className="fa-solid fa-box-archive text-[10px]" />} Archivar tema
      </button>
    </div>
  );
}
