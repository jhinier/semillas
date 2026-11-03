import { enviarEventosProgreso } from "@/features/progress/progress.api";
import { db, queueEventoProgreso } from "@/lib/offline";
import { claveCacheScope } from "@/lib/offline/scoped-cache";
import { obtenerScopeOffline } from "@/lib/offline/user-scope";
import type { EventoProgreso } from "@/shared/api/api";

const CACHE_KEY_PROGRESO = "semillas_progreso_cache_v1";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizarEventosParaServidor(eventos: EventoProgreso[]): EventoProgreso[] {
  return eventos
    .filter((ev) => !ev.tema_id || UUID_REGEX.test(ev.tema_id))
    .map((ev) => ({
      ...ev,
      paso_id: ev.paso_id && UUID_REGEX.test(ev.paso_id) ? ev.paso_id : undefined,
      actividad_id: ev.actividad_id && UUID_REGEX.test(ev.actividad_id) ? ev.actividad_id : undefined,
    }));
}

/**
 * Registra progreso en línea y, cuando el tema fue descargado o no hay red, lo encola en
 * IndexedDB y actualiza el caché local sin bloquear el avance del usuario.
 */
export async function registrarEventosCrecer(eventos: EventoProgreso[]): Promise<void> {
  // Siempre actualizar el caché local inmediatamente para que la barra de progreso, XP e insignias respondan al instante
  await actualizarCacheProgresoLocal(eventos);

  const eventosRemotos = normalizarEventosParaServidor(eventos);
  if (eventosRemotos.length === 0) {
    return;
  }

  if (typeof navigator !== "undefined" && navigator.onLine) {
    try {
      await enviarEventosProgreso(eventosRemotos);
      return;
    } catch {
      await encolarEventosLocales(eventosRemotos).catch(() => false);
      return;
    }
  }

  await encolarEventosLocales(eventosRemotos).catch(() => false);
}

async function encolarEventosLocales(eventos: EventoProgreso[]): Promise<boolean> {
  for (const evento of eventos) {
    const temaServidorId = evento.tema_id;
    if (!temaServidorId) return false;

    const temaLocal =
      (await db.temas.where("serverId").equals(temaServidorId).first()) ??
      (await db.temas.get(temaServidorId)) ??
      (await db.temas.where("slug").equals(temaServidorId).first());
    if (!temaLocal) return false;

    const pasoLocal = evento.paso_id
      ? (await db.pasos.where("serverId").equals(evento.paso_id).first()) ??
        (await db.pasos.get(evento.paso_id))
      : undefined;
    const actividadLocal = evento.actividad_id
      ? (await db.actividades.where("serverId").equals(evento.actividad_id).first()) ??
        (await db.actividades.get(evento.actividad_id))
      : undefined;

    await queueEventoProgreso(evento.tipo_evento, {
      temaLocalId: temaLocal.localId,
      pasoLocalId: pasoLocal?.localId,
      actividadLocalId: actividadLocal?.localId,
      correcta: evento.correcta,
      puntaje: evento.puntaje,
      datos: evento.datos,
    });
  }

  return true;
}

async function actualizarCacheProgresoLocal(eventos: EventoProgreso[]): Promise<void> {
  try {
    const scope = (await obtenerScopeOffline()) ?? "default";
    const clave = claveCacheScope(CACHE_KEY_PROGRESO, scope);
    if (!clave) return;

    const raw = localStorage.getItem(clave);
    const parsed = raw
      ? (JSON.parse(raw) as {
          data?: {
            progresos_tema: Array<{
              usuario_id: string;
              tema_id: string;
              estado: string;
              porcentaje: number;
              iniciado_en: string | null;
              completado_en: string | null;
              ultimo_paso_id: string | null;
              actualizado_en: string;
            }>;
            progresos_actividad: Array<{
              usuario_id: string;
              actividad_id: string;
              intentos: number;
              mejor_puntaje: number;
              completado: boolean;
              completado_en: string | null;
              actualizado_en: string;
            }>;
          };
        })
      : null;

    const data = parsed?.data ?? { progresos_tema: [], progresos_actividad: [] };
    const now = new Date().toISOString();

    for (const ev of eventos) {
      if (ev.tema_id) {
        const idx = data.progresos_tema.findIndex((t) => t.tema_id === ev.tema_id);
        const esCompletado = ev.tipo_evento === "tema_completado";
        const incremento = ev.tipo_evento === "bloque_completado" ? 17 : 0;
        if (idx >= 0) {
          const actual = data.progresos_tema[idx]!;
          const nuevoPorcentaje = esCompletado
            ? 100
            : Math.min(99, Math.max(actual.porcentaje, actual.porcentaje + incremento));
          data.progresos_tema[idx] = {
            ...actual,
            estado: esCompletado || nuevoPorcentaje >= 100 ? "completado" : "en_progreso",
            porcentaje: nuevoPorcentaje,
            ultimo_paso_id: ev.paso_id ?? actual.ultimo_paso_id,
            completado_en: esCompletado ? now : actual.completado_en,
            actualizado_en: now,
          };
        } else {
          data.progresos_tema.push({
            usuario_id: scope,
            tema_id: ev.tema_id,
            estado: esCompletado ? "completado" : "en_progreso",
            porcentaje: esCompletado ? 100 : incremento,
            iniciado_en: now,
            completado_en: esCompletado ? now : null,
            ultimo_paso_id: ev.paso_id ?? null,
            actualizado_en: now,
          });
        }
      }

      if (ev.actividad_id && ev.tipo_evento === "actividad_completada") {
        const idx = data.progresos_actividad.findIndex((a) => a.actividad_id === ev.actividad_id);
        if (idx >= 0) {
          data.progresos_actividad[idx] = {
            ...data.progresos_actividad[idx]!,
            completado: true,
            completado_en: now,
            actualizado_en: now,
          };
        } else {
          data.progresos_actividad.push({
            usuario_id: scope,
            actividad_id: ev.actividad_id,
            intentos: 1,
            mejor_puntaje: ev.puntaje ?? 100,
            completado: true,
            completado_en: now,
            actualizado_en: now,
          });
        }
      }
    }

    localStorage.setItem(clave, JSON.stringify({ data, savedAt: now }));
  } catch {
    // no bloquear si localStorage falla
  }
}
