import type { TemaUI, EstadoTema } from "@/features/themes/types";
import type { Tema } from "@/shared/api/api";

const STORAGE_KEY = "semillas:favoritos";

export function leerFavoritos(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function guardarFavoritos(favs: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

export function mapearTema(t: Tema, porcentajeReal: number): TemaUI {
  const estado: EstadoTema =
    porcentajeReal >= 100 ? "completada" : porcentajeReal > 0 ? "enProgreso" : "porDefecto";

  return {
    id: t.id,
    titulo: t.titulo,
    descripcion: t.resumen ?? t.objetivo ?? "Explora este increíble tema bíblico.",
    senda: t.senda?.nombre ?? "Senda de Aprendizaje",
    duracion: `${t.minutos_estimados ?? 10} min`,
    xp: t.xp_recompensa ?? 100,
    progreso: porcentajeReal,
    favorito: false,
    imagenUrl: null,
    estado,
    progresoTema: null,
  };
}
