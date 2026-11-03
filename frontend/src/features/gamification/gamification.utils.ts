import type {
  GamificacionPropia,
  LogroGamificacion,
  LogroUsuarioGamificacion,
  ReglaNivelGamificacion,
} from "./gamification.api";

export const REGLAS_NIVEL_DEFAULT: ReglaNivelGamificacion[] = [
  { numero_nivel: 1, nombre: "Brote", xp_minima: 0 },
  { numero_nivel: 2, nombre: "Raíz", xp_minima: 100 },
  { numero_nivel: 3, nombre: "Tallo", xp_minima: 250 },
  { numero_nivel: 4, nombre: "Rama", xp_minima: 500 },
  { numero_nivel: 5, nombre: "Árbol", xp_minima: 1000 },
  { numero_nivel: 6, nombre: "Cosecha", xp_minima: 2000 },
  { numero_nivel: 7, nombre: "Explorador", xp_minima: 3000 },
];

export const CATALOGO_LOGROS_DEFAULT: LogroGamificacion[] = [
  {
    id: "fallback-primera-leccion",
    codigo: "primera_leccion",
    nombre: "Primer paso",
    descripcion: "Se otorga al completar tu primer tema bíblico completo en Semillas.",
    url_icono: null,
    bono_xp: 20,
    codigo_criterio: "temas_completados",
    valor_criterio: 1,
    activo: true,
    creado_en: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "fallback-amor-de-dios",
    codigo: "tema-amor-de-dios",
    nombre: "El Amor de Dios",
    descripcion:
      "Se otorga al completar los 6 pasos CRECER y las actividades del tema «El Amor de Dios».",
    url_icono: null,
    bono_xp: 25,
    codigo_criterio: "temas_completados",
    valor_criterio: 1,
    activo: true,
    creado_en: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "fallback-jesus-parabolas",
    codigo: "tema-jesus-parabolas",
    nombre: "Discípulo del Maestro",
    descripcion:
      "Se otorga al completar los 6 pasos CRECER y las actividades del tema «Jesús enseña con parábolas».",
    url_icono: null,
    bono_xp: 25,
    codigo_criterio: "temas_completados",
    valor_criterio: 2,
    activo: true,
    creado_en: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "fallback-frutos-espiritu",
    codigo: "tema-frutos-espiritu",
    nombre: "Corazón con Fruto",
    descripcion:
      "Se otorga al completar los 6 pasos CRECER y las actividades del tema «Los frutos del Espíritu».",
    url_icono: null,
    bono_xp: 25,
    codigo_criterio: "temas_completados",
    valor_criterio: 3,
    activo: true,
    creado_en: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "fallback-explorador-palabra",
    codigo: "explorador_palabra",
    nombre: "Explorador de la Palabra",
    descripcion:
      "Se otorga al resolver correctamente 10 actividades interactivas en tus lecciones.",
    url_icono: null,
    bono_xp: 50,
    codigo_criterio: "actividades_completadas",
    valor_criterio: 10,
    activo: true,
    creado_en: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "fallback-racha-siete-dias",
    codigo: "racha_siete_dias",
    nombre: "Semilla constante",
    descripcion:
      "Se otorga por mantener una racha de aprendizaje durante 7 días seguidos.",
    url_icono: null,
    bono_xp: 50,
    codigo_criterio: "dias_racha",
    valor_criterio: 7,
    activo: true,
    creado_en: "2026-01-01T00:00:00.000Z",
  },
];

const CLAIMED_BADGES_KEY = "semillas_logros_reclamados_local_v1";

export function leerLogrosReclamadosLocales(): Record<string, string> {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(CLAIMED_BADGES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export function guardarLogroReclamadoLocal(logroId: string): void {
  if (typeof localStorage === "undefined") return;
  try {
    const actual = leerLogrosReclamadosLocales();
    actual[logroId] = new Date().toISOString();
    localStorage.setItem(CLAIMED_BADGES_KEY, JSON.stringify(actual));
  } catch {
    // ignorar
  }
}

function leerEstadisticasProgresoLocal(): {
  temasCompletados: number;
  actividadesCompletadas: number;
  ultimoCompletadoEn: string;
} {
  if (typeof localStorage === "undefined") {
    return {
      temasCompletados: 0,
      actividadesCompletadas: 0,
      ultimoCompletadoEn: new Date().toISOString(),
    };
  }

  let temasCompletados = 0;
  let actividadesCompletadas = 0;
  let ultimoCompletadoEn = new Date().toISOString();

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("semillas_progreso_cache_v1")) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as {
        data?: {
          progresos_tema?: Array<{
            estado?: string;
            porcentaje?: number;
            completado_en?: string | null;
          }>;
          progresos_actividad?: Array<{
            completado?: boolean;
            completado_en?: string | null;
          }>;
        };
      };
      const temas = parsed?.data?.progresos_tema ?? [];
      const actividades = parsed?.data?.progresos_actividad ?? [];
      const tComp = temas.filter(
        (t) => t.estado === "completado" || (t.porcentaje ?? 0) >= 100,
      ).length;
      const aComp = actividades.filter((a) => a.completado).length;
      if (tComp > temasCompletados) temasCompletados = tComp;
      if (aComp > actividadesCompletadas) actividadesCompletadas = aComp;
      const fecha =
        temas.find((t) => t.completado_en)?.completado_en ??
        actividades.find((a) => a.completado_en)?.completado_en;
      if (fecha) ultimoCompletadoEn = fecha;
    }
  } catch {
    // ignorar errores de lectura
  }

  return { temasCompletados, actividadesCompletadas, ultimoCompletadoEn };
}

export function crearGamificacionOffline(): GamificacionPropia {
  const stats = leerEstadisticasProgresoLocal();
  const reclamados = leerLogrosReclamadosLocales();

  const logrosDesbloqueados: LogroUsuarioGamificacion[] = [];
  for (const logro of CATALOGO_LOGROS_DEFAULT) {
    let cumplido = false;
    if (logro.codigo_criterio === "temas_completados") {
      cumplido = stats.temasCompletados >= (logro.valor_criterio ?? 1);
    } else if (logro.codigo_criterio === "actividades_completadas") {
      cumplido = stats.actividadesCompletadas >= (logro.valor_criterio ?? 1);
    }

    if (cumplido || reclamados[logro.id]) {
      logrosDesbloqueados.push({
        usuario_id: "local",
        logro_id: logro.id,
        ganado_en: stats.ultimoCompletadoEn,
        reclamado_en: reclamados[logro.id] ?? null,
        logro,
      });
    }
  }

  const bonoReclamado = logrosDesbloqueados.reduce(
    (acc, item) => acc + (item.reclamado_en && item.logro ? item.logro.bono_xp : 0),
    0,
  );
  const xpTotal =
    stats.temasCompletados * 150 + stats.actividadesCompletadas * 25 + bonoReclamado;

  const reglaActual =
    REGLAS_NIVEL_DEFAULT.filter((r) => r.xp_minima <= xpTotal).at(-1) ??
    REGLAS_NIVEL_DEFAULT[0]!;
  const pendientesReclamar = logrosDesbloqueados.filter((l) => !l.reclamado_en).length;

  return {
    nivel: {
      usuario_id: "local",
      xp_total: xpTotal,
      numero_nivel: reglaActual.numero_nivel,
      nombre_nivel: reglaActual.nombre,
    },
    logros: logrosDesbloqueados,
    catalogo_logros: CATALOGO_LOGROS_DEFAULT,
    reglas_nivel: REGLAS_NIVEL_DEFAULT,
    racha: {
      actual: stats.temasCompletados > 0 || stats.actividadesCompletadas > 0 ? 1 : 0,
      mejor: stats.temasCompletados > 0 || stats.actividadesCompletadas > 0 ? 1 : 0,
    },
    pendientes_reclamar: pendientesReclamar,
  };
}
