import { peticion } from "../../shared/api/api";
import { claveCacheScope } from "@/lib/offline/scoped-cache";
import { obtenerScopeOffline } from "@/lib/offline/user-scope";
import {
  CATALOGO_LOGROS_DEFAULT,
  REGLAS_NIVEL_DEFAULT,
  crearGamificacionOffline,
  guardarLogroReclamadoLocal,
} from "./gamification.utils";
export { crearGamificacionOffline } from "./gamification.utils";

export type LogroGamificacion = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  url_icono: string | null;
  bono_xp: number;
  codigo_criterio: string;
  valor_criterio: number | null;
  activo: boolean;
  creado_en: string;
};

export type LogroUsuarioGamificacion = {
  usuario_id: string;
  logro_id: string;
  ganado_en: string;
  /** null = desbloqueado pero pendiente de reclamar; string = ya reclamado */
  reclamado_en: string | null;
  logro: LogroGamificacion | null;
};

export type ReglaNivelGamificacion = {
  numero_nivel: number;
  nombre: string;
  xp_minima: number;
};

export type GamificacionPropia = {
  nivel: {
    usuario_id: string | null;
    xp_total: number;
    numero_nivel: number;
    nombre_nivel: string;
  } | null;
  logros: LogroUsuarioGamificacion[];
  catalogo_logros?: LogroGamificacion[];
  reglas_nivel?: ReglaNivelGamificacion[];
  racha?: { actual: number; mejor: number };
  /** Cantidad de logros desbloqueados que el usuario aún no ha reclamado */
  pendientes_reclamar?: number;
};

const CACHE_KEY = "semillas_gamification_cache_v2";

function normalizarGamificacion(data: GamificacionPropia): GamificacionPropia {
  const reglas = data.reglas_nivel?.length ? data.reglas_nivel : REGLAS_NIVEL_DEFAULT;
  const catalogo = data.catalogo_logros?.length ? data.catalogo_logros : CATALOGO_LOGROS_DEFAULT;
  const xpTotal = data.nivel?.xp_total ?? 0;
  const reglaActual =
    reglas.filter((r) => r.xp_minima <= xpTotal).at(-1) ??
    reglas[0] ??
    REGLAS_NIVEL_DEFAULT[0]!;

  return {
    ...data,
    nivel: data.nivel ?? {
      usuario_id: "local",
      xp_total: xpTotal,
      numero_nivel: reglaActual.numero_nivel,
      nombre_nivel: reglaActual.nombre,
    },
    catalogo_logros: catalogo,
    reglas_nivel: reglas,
    racha: data.racha ?? { actual: 0, mejor: 0 },
  };
}

export async function obtenerGamificacionPropia(): Promise<GamificacionPropia> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return (await leerCacheGamificacion()) ?? crearGamificacionOffline();
  }

  try {
    const rawData = await peticion<GamificacionPropia>("/gamificacion/mi");
    const data = normalizarGamificacion(rawData);
    try {
      const clave = claveCacheScope(CACHE_KEY, await obtenerScopeOffline());
      if (clave) {
        localStorage.setItem(
          clave,
          JSON.stringify({ data, savedAt: new Date().toISOString() }),
        );
      }
    } catch {
      // El contenido descargado sigue funcionando aunque el navegador bloquee localStorage.
    }
    return data;
  } catch {
    const cached = await leerCacheGamificacion();
    if (cached) return normalizarGamificacion(cached);
    return crearGamificacionOffline();
  }
}

/** Reclama un logro desbloqueado. Devuelve el bono XP otorgado e incluye soporte offline. */
export async function reclamarLogroApi(
  logroId: string,
): Promise<{ bono_xp: number; nombre: string }> {
  const buscarLogroLocal = () => {
    const encontrado = CATALOGO_LOGROS_DEFAULT.find((l) => l.id === logroId);
    return {
      bono_xp: encontrado?.bono_xp ?? 25,
      nombre: encontrado?.nombre ?? "Insignia desbloqueada",
    };
  };

  if ((typeof navigator !== "undefined" && !navigator.onLine) || logroId.startsWith("fallback-")) {
    guardarLogroReclamadoLocal(logroId);
    return buscarLogroLocal();
  }

  try {
    return await peticion<{ bono_xp: number; nombre: string }>(
      `/gamificacion/logros/${logroId}/reclamar`,
      {
        metodo: "POST",
      },
    );
  } catch {
    guardarLogroReclamadoLocal(logroId);
    return buscarLogroLocal();
  }
}

async function leerCacheGamificacion(): Promise<GamificacionPropia | null> {
  const clave = claveCacheScope(CACHE_KEY, await obtenerScopeOffline());
  if (!clave) return null;
  try {
    const raw = localStorage.getItem(clave);
    if (raw) {
      const parsed = JSON.parse(raw) as { data?: GamificacionPropia };
      if (parsed.data) return parsed.data;
    }
  } catch {
    // Se devuelve un resumen seguro si no hay cache legible.
  }

  return null;
}
