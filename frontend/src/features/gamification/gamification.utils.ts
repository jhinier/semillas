import type { GamificacionPropia } from "./gamification.api";

export function crearGamificacionOffline(): GamificacionPropia {
  return {
    nivel: null,
    logros: [],
    catalogo_logros: [],
    reglas_nivel: [],
    racha: { actual: 0, mejor: 0 },
    pendientes_reclamar: 0,
  };
}
