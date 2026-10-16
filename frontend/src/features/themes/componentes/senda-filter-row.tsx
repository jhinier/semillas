import { Route } from "lucide-react";
import { Chip } from "@/componentes/ui/chip";

type SendaFiltro = "padre" | "hijo" | "espiritu";

const SENDAS = [
  { id: "todas", label: "Todas las sendas", labelMovil: "Todas", color: "gris" as const },
  { id: "padre", label: "Senda del Padre", labelMovil: "Padre", color: "amarillo" as const },
  { id: "hijo", label: "Senda del Hijo", labelMovil: "Hijo", color: "azul" as const },
  { id: "espiritu", label: "Senda del Espíritu Santo", labelMovil: "Espíritu", color: "verde" as const },
];

export function normalizarSenda(s: string) {
  const v = s.toLowerCase();
  if (v.includes("padre")) return "padre";
  if (v.includes("hijo")) return "hijo";
  if (v.includes("espíritu") || v.includes("espiritu")) return "espiritu";
  return "todas";
}

interface SendaFilterRowProps {
  searchSenda?: SendaFiltro;
  onSendaChange: (senda: SendaFiltro | "todas") => void;
}

export function SendaFilterRow({ searchSenda, onSendaChange }: SendaFilterRowProps) {
  return (
    <div className="temas-senda-scroll -mx-1 mb-3 flex flex-nowrap snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible">
      {SENDAS.map((senda) => {
        const activa = (senda.id === "todas" && !searchSenda) || searchSenda === senda.id;
        return (
          <button
            key={senda.id}
            type="button"
            aria-pressed={activa}
            onClick={() => onSendaChange(senda.id as SendaFiltro | "todas")}
            className="flex-none snap-start rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2"
          >
            <Chip
              color={senda.color}
              forma="badgePildora"
              icono={<Route className="size-3.5" />}
              className={activa ? "ring-2 ring-offset-1 ring-slate-900/10" : "opacity-75 hover:opacity-100"}
            >
              <span className="md:hidden">{senda.labelMovil}</span>
              <span className="hidden md:inline">{senda.label}</span>
            </Chip>
          </button>
        );
      })}
    </div>
  );
}
