import { ArrowLeft, ArrowRight } from "lucide-react";

interface NavegacionControlesProps {
  currentIndex: number;
  totalCount: number;
  selectedOption: boolean | null;
  onPrev: () => void;
  onNext: () => void;
}

export function NavegacionControles({
  currentIndex,
  totalCount,
  selectedOption,
  onPrev,
  onNext,
}: NavegacionControlesProps) {
  const isLast = currentIndex === totalCount - 1;

  return (
    <div className="flex flex-col-reverse sm:flex-row justify-center items-center gap-4 w-full mt-8">
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="w-full sm:w-auto px-6 py-3 rounded-xl text-slate-500 font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 disabled:opacity-0 transition-all"
      >
        <ArrowLeft size={18} /> Anterior
      </button>

      <button
        onClick={onNext}
        disabled={selectedOption === null}
        className="w-full sm:w-auto px-8 py-3 rounded-xl border-2 border-blue-200 text-blue-700 font-bold flex items-center justify-center gap-2 transition-colors hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        {isLast ? "Finalizar" : "Siguiente"} <ArrowRight size={18} />
      </button>
    </div>
  );
}
