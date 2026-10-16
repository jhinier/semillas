import type { RetoClubAdmin } from "../../admin-clubes.api";

export function formatoFechaClub(fecha: string | null) {
  if (!fecha) return "Sin fecha";
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(new Date(fecha));
}

export function nombreMetricaReto(codigo: RetoClubAdmin["codigo_metrica"]) {
  if (codigo === "xp_grupal") return "XP grupal";
  if (codigo === "actividades_completadas") return "Actividades completadas";
  return "Temas completados";
}

export function retoClubEstaAbierto(reto: RetoClubAdmin) {
  return new Date(reto.fecha_fin).getTime() > Date.now();
}

export function rolMiembroHumano(rol: string | null) {
  if (rol === "propietario") return "Propietario";
  if (rol === "lider") return "Líder";
  return "Miembro";
}
