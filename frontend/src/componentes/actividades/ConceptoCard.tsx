import { CheckCircle2, Grip } from "lucide-react";
import type { ParConcepto } from "./relacionar-conceptos.utils";

type ConceptoCardProps = {
  par: ParConcepto;
  completada: boolean;
  seleccionada: boolean;
  mostrarPistas: boolean;
  onSeleccionar: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
};

export function ConceptoCard({
  par,
  completada,
  seleccionada,
  mostrarPistas,
  onSeleccionar,
  onDragStart,
  onDragEnd,
}: ConceptoCardProps) {
  return (
    <button
      type="button"
      draggable={!completada}
      disabled={completada}
      onClick={() => onSeleccionar(par.id)}
      onDragStart={() => onDragStart(par.id)}
      onDragEnd={onDragEnd}
      aria-label={`Concepto ${par.concepto}`}
      aria-pressed={seleccionada}
      className={[
        "touch-manipulation rounded-3xl border-2 bg-white px-4 py-4 text-left text-sm font-black shadow-sm transition duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3D8BD4]",
        completada ? "border-[#86EFAC] text-[#166534] opacity-80" : "border-white text-[#123B2C] hover:-translate-y-0.5 active:scale-[0.98]",
        seleccionada ? "border-[#3D8BD4] ring-4 ring-[#3D8BD4]/25" : "",
      ].join(" ")}
    >
      <span className="flex items-center justify-between gap-3">
        <span>{par.concepto}</span>
        {completada ? (
          <CheckCircle2 className="size-5 text-[#2E9E5B]" aria-hidden="true" />
        ) : (
          <Grip className="size-5 text-[#6E7F76]" aria-hidden="true" />
        )}
      </span>
      {mostrarPistas && par.pista && (
        <span className="mt-2 block text-xs font-bold leading-5 text-[#6E7F76]">
          Pista: {par.pista}
        </span>
      )}
    </button>
  );
}
