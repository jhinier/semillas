import { LOCALE, METRICAS } from "./constants";

export function formatMonth(value: string): string {
  return new Intl.DateTimeFormat(LOCALE, { month: "short", year: "numeric" }).format(new Date(value));
}

export function daysRemaining(value: string): string {
  const days = Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
  if (days <= 0) return "Finalizado";
  if (days === 1) return "1 día";
  return `${days} días`;
}

export function metricDescription(metric: string): string {
  if (metric === METRICAS.XP_GRUPAL) return "Sumen XP entre todos los miembros del club.";
  if (metric === METRICAS.TEMAS_COMPLETADOS) return "Completen temas entre todos para alcanzar la meta.";
  return "Completen actividades y aporten al objetivo común.";
}

export function roleName(role: string): string {
  if (role === "lider" || role === "propietario") return "Líder";
  return "Miembro";
}

export function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}
