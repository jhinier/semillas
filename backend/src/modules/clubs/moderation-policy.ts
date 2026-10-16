import type { EstadoReporteClub } from "./moderation.schemas";

const TRANSICIONES: Record<EstadoReporteClub, readonly EstadoReporteClub[]> = {
  abierto: ["en_revision", "descartado"],
  en_revision: ["abierto", "resuelto", "descartado"],
  resuelto: [],
  descartado: [],
};

export function puedeTransicionarReporte(actual: EstadoReporteClub, siguiente: EstadoReporteClub): boolean {
  return TRANSICIONES[actual].includes(siguiente);
}
