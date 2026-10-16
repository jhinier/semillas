import { enviarEventosProgreso } from "@/features/progress/progress.api";
import { db, queueEventoProgreso } from "@/lib/offline";
import type { EventoProgreso } from "@/shared/api/api";

/**
 * Registra progreso en línea y, cuando el tema fue descargado, lo encola en
 * IndexedDB si no hay conexión. El servidor sigue siendo la autoridad de XP.
 */
export async function registrarEventosCrecer(eventos: EventoProgreso[]): Promise<void> {
  if (navigator.onLine) {
    try {
      await enviarEventosProgreso(eventos);
      return;
    } catch (error) {
      const pudoEncolar = await encolarEventosLocales(eventos);
      if (pudoEncolar) return;
      throw error;
    }
  }

  const pudoEncolar = await encolarEventosLocales(eventos);
  if (!pudoEncolar) {
    throw new Error(
      "Este tema no está descargado. Conéctate a internet o descárgalo antes de continuar sin conexión.",
    );
  }
}

async function encolarEventosLocales(eventos: EventoProgreso[]): Promise<boolean> {
  for (const evento of eventos) {
    const temaServidorId = evento.tema_id;
    if (!temaServidorId) return false;

    const temaLocal = await db.temas.where("serverId").equals(temaServidorId).first();
    if (!temaLocal) return false;

    const pasoLocal = evento.paso_id
      ? await db.pasos.where("serverId").equals(evento.paso_id).first()
      : undefined;
    const actividadLocal = evento.actividad_id
      ? await db.actividades.where("serverId").equals(evento.actividad_id).first()
      : undefined;

    if (evento.paso_id && !pasoLocal) return false;
    if (evento.actividad_id && !actividadLocal) return false;

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
