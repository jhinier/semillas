import type { Actividad } from "../../../shared/api/api";

export type BadgeColorConfig = {
  badge: string;
  bg: string;
  label: string;
};

export const COLORES_BADGE_ACTIVIDAD: Record<string, BadgeColorConfig> = {
  cuestionario: {
    badge: "text-violet-700",
    bg: "bg-violet-100",
    label: "Quiz",
  },
  verdadero_falso: {
    badge: "text-blue-700",
    bg: "bg-blue-100",
    label: "Verdadero o Falso",
  },
  relacionar_pares: {
    badge: "text-orange-700",
    bg: "bg-orange-100",
    label: "Relacionar Conceptos",
  },
  manualidad: {
    badge: "text-pink-700",
    bg: "bg-pink-100",
    label: "Manualidad",
  },
  tarjetas_memoria: {
    badge: "text-amber-700",
    bg: "bg-amber-100",
    label: "Flashcards",
  },
  sopa_letras: {
    badge: "text-orange-700",
    bg: "bg-orange-100",
    label: "Sopa de Letras",
  },
  rompecabezas: {
    badge: "text-indigo-700",
    bg: "bg-indigo-100",
    label: "Rompecabezas",
  },
};

export function obtenerColoresActividad(actividad: Actividad): BadgeColorConfig {
  const tipo = actividad.tipo_actividad?.codigo ?? "";
  return COLORES_BADGE_ACTIVIDAD[tipo] ?? {
    badge: "text-slate-700",
    bg: "bg-slate-100",
    label: actividad.tipo_actividad?.nombre ?? "Actividad",
  };
}
