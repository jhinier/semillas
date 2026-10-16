import { CheckCircle2 } from "lucide-react";
import type { RelacionConcepto } from "./relacionar-conceptos.utils";

type RelacionCardProps = {
  relacion: RelacionConcepto;
  completada: boolean;
  onSeleccionar: (relacion: RelacionConcepto) => void;
  onDrop: (relacion: RelacionConcepto) => void;
};

export function RelacionCard({
  relacion,
  completada,
  onSeleccionar,
  onDrop,
}: RelacionCardProps) {
  return (
    <button
      type="button"
      disabled={completada}
      onClick={() => onSeleccionar(relacion)}
      onDragOver={(evento) => evento.preventDefault()}
      onDrop={() => onDrop(relacion)}
      aria-label={`Relacion ${relacion.texto}`}
      className={[
        "min-h-16 touch-manipulation rounded-3xl border-2 bg-white px-4 py-4 text-left text-sm font-black shadow-sm transition duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3D8BD4]",
        completada ? "border-[#86EFAC] text-[#166534] opacity-80" : "border-white text-[#123B2C] hover:-translate-y-0.5 active:scale-[0.98]",
      ].join(" ")}
    >
      <span className="flex items-center justify-between gap-3">
        <span>{relacion.texto}</span>
        {completada && (
          <CheckCircle2 className="size-5 text-[#2E9E5B]" aria-hidden="true" />
        )}
      </span>
    </button>
  );
}
