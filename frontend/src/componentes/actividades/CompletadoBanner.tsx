import { CheckCircle2 } from "lucide-react";

export function CompletadoBanner() {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-emerald-200 bg-[#DCFCE7] px-4 py-3 text-[#166534] dark:border-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-200">
      <CheckCircle2 className="size-6 shrink-0" aria-hidden="true" />
      <p className="text-sm font-black dark:text-emerald-200">Excelente. Relacionaste todos los conceptos.</p>
    </div>
  );
}
