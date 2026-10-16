import { Cloud } from "lucide-react";
import { type ThemeCardState } from "./theme-card";
import { unirClases } from "@/lib/utilidades";

interface BarraProgresoProps {
  progreso: number;
  claseRellenoBarra: string;
}

export function BarraProgreso({ progreso, claseRellenoBarra }: BarraProgresoProps) {
  return (
    <div className="theme-card__progress flex w-full items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={unirClases("h-full rounded-full transition-all duration-300", claseRellenoBarra)}
          style={{ width: `${progreso}%` }}
        />
      </div>
      <span className="min-w-[30px] text-right text-xs font-black text-slate-700">
        {progreso}%
      </span>
    </div>
  );
}

interface BadgeSinConexionProps {
  visible: boolean;
}

export function BadgeSinConexion({ visible }: BadgeSinConexionProps) {
  if (!visible) return null;

  return (
    <div className="flex items-center justify-center gap-1 rounded-lg border border-blue-500/20 bg-blue-50 py-1 text-[10px] font-bold text-blue-500">
      <Cloud className="size-3.5 fill-blue-500" />
      <span>Disponible sin conexión</span>
    </div>
  );
}

function obtenerEtiquetaEstado(estado: ThemeCardState): string {
  switch (estado) {
    case "completada":
      return "Repasar tema";
    case "enProgreso":
      return "Continuar tema";
    case "bloqueada":
      return "Bloqueado";
    case "error":
      return "Error";
    default:
      return "Empezar tema";
  }
}

interface BotonEstadoProps {
  estado: ThemeCardState;
}

export function BotonEstado({ estado }: BotonEstadoProps) {
  const etiqueta = obtenerEtiquetaEstado(estado);

  if (estado === "error") {
    return (
      <span className="self-center rounded-full border border-red-200 bg-red-50 px-5 py-1.5 text-[10px] font-black text-red-500">
        Error
      </span>
    );
  }

  if (estado === "bloqueada") {
    return (
      <span className="self-center rounded-full bg-slate-100 px-5 py-1.5 text-[10px] font-black text-slate-400">
        Bloqueado
      </span>
    );
  }

  if (estado === "completada") {
    return (
      <span className="self-center rounded-full bg-purple-100 px-5 py-1.5 text-[10px] font-black text-purple-600">
        Repasar tema
      </span>
    );
  }

  return (
    <span
        className={unirClases(
          "theme-card__action inline-flex w-full max-w-[240px] items-center justify-center gap-2 self-center rounded-full px-5 py-3 text-[13px] font-black transition-colors sm:w-auto sm:max-w-none sm:py-2 sm:text-[10px]",
          estado === "enProgreso" ? "bg-sky-100 text-sky-600" : "bg-slate-900 text-white group-hover:bg-primario",
        )}
      >
      {etiqueta}
    </span>
  );
}
