import { Loader } from "lucide-react";

interface FormNavigationProps {
  isPending: boolean;
  onSaveDraft: () => void;
}

export function FormNavigation({ isPending, onSaveDraft }: FormNavigationProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        onClick={onSaveDraft}
        className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <i className="fa-regular fa-floppy-disk text-[10px]" />
        Guardar borrador
      </button>

      <button
        type="submit"
        disabled={isPending}
        className="w-full !bg-verde-brote hover:opacity-95 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        {isPending ? <Loader className="animate-spin text-white" size={12} /> : null}
        <span>Continuar a CRECER</span>
        <i className="fa-solid fa-arrow-right text-[10px]" />
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold mt-2 select-none">
        <i className="fa-solid fa-lock text-[9px]" />
        <span>Tu progreso se guarda automáticamente</span>
      </div>
    </div>
  );
}
