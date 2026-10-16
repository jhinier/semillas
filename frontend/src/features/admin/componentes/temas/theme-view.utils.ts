export function formatElapsed(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `hace ${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `hace ${diffDays}d`;
  } catch {
    return "—";
  }
}

export function formatearFechaTema(fecha?: string | null) {
  if (!fecha) return "—";

  return new Date(fecha).toLocaleDateString("es-EC", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatearFechaHoraTema(fecha?: string | null) {
  if (!fecha) return "—";

  return new Date(fecha).toLocaleString("es-EC", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function obtenerEstadoTema(estado: string) {
  const estadoNormalizado = estado.trim().toLowerCase();

  switch (estadoNormalizado) {
    case "publicado":
      return {
        etiqueta: "Publicado",
        clase: "border-emerald-200 bg-emerald-50 text-emerald-700",
        punto: "bg-emerald-500",
        fondoHero: "from-emerald-950 via-emerald-900 to-green-950",
        brillo: "bg-emerald-400/20",
      };
    case "revision":
      return {
        etiqueta: "En revisión",
        clase: "border-amber-200 bg-amber-50 text-amber-700",
        punto: "bg-amber-500",
        fondoHero: "from-amber-950 via-amber-900 to-green-950",
        brillo: "bg-amber-400/20",
      };
    case "archivado":
      return {
        etiqueta: "Archivado",
        clase: "border-slate-200 bg-slate-100 text-slate-600",
        punto: "bg-slate-400",
        fondoHero: "from-slate-950 via-slate-800 to-green-950",
        brillo: "bg-slate-400/20",
      };
    default:
      return {
        etiqueta: "Borrador",
        clase: "border-sky-200 bg-sky-50 text-sky-700",
        punto: "bg-sky-500",
        fondoHero: "from-sky-950 via-sky-900 to-green-950",
        brillo: "bg-sky-400/20",
      };
  }
}
