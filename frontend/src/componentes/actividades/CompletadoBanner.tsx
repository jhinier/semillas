import { CheckCircle2 } from "lucide-react";

export function CompletadoBanner() {
  return (
    <div className="flex items-center gap-3 rounded-3xl bg-[#DCFCE7] px-4 py-3 text-[#166534]">
      <CheckCircle2 className="size-6 shrink-0" aria-hidden="true" />
      <p className="text-sm font-black">Excelente. Relacionaste todos los conceptos.</p>
    </div>
  );
}
