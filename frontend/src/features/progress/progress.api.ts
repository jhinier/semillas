import { peticion, RUTAS_API } from "../../shared/api/api";
import type { EventoProgreso } from "../../shared/api/api";
import { obtenerMiProgreso as obtenerMiProgresoConFallbackOffline } from "../perfil/profile.api";

export type ProgresoResumen = {
  progresos_tema: Array<{
    tema_id: string;
    estado: "en_progreso" | "completado";
    porcentaje: number;
    iniciado_en: string | null;
    completado_en: string | null;
    ultimo_paso_id: string | null;
  }>;
  progresos_actividad: Array<{
    actividad_id: string;
    intentos: number;
    mejor_puntaje: number;
    completado: boolean;
  }>;
};

/**
 * Registra y procesa eventos de progreso del usuario de manera segura e idempotente.
 *
 * HTTP Verb: POST
 * Endpoint: /progreso/eventos
 * Auth: Requerido
 */
export async function enviarEventosProgreso(eventos: EventoProgreso[]) {
  let procesados = 0;
  let ultimoError: string | undefined;
  const logrosGanados: Array<{
    id: string;
    nombre: string;
    codigo: string;
    descripcion: string | null;
    bono_xp: number;
    url_icono: string | null;
  }> = [];

  for (const ev of eventos) {
    if (ev.tipo_evento === "bloque_completado") {
      console.log(`[Frontend] 🎉 Bloque de fase completado (Tema: ${ev.tema_id}, Paso: ${ev.paso_id}). ¡El progreso aumentará!`);
    }

    try {
      const resp = await registrarEventoProgreso({
        evento_id_cliente: ev.evento_id_cliente,
        tipo_evento: ev.tipo_evento,
        tema_id: ev.tema_id,
        paso_id: ev.paso_id,
        actividad_id: ev.actividad_id,
        correcta: ev.correcta,
        puntaje: ev.puntaje,
        xp_otorgada: ev.xp_otorgada,
        datos: ev.datos,
        ocurrido_en_cliente: ev.ocurrido_en_cliente,
        dispositivo_id: ev.dispositivo_id
      });

      if (!resp.duplicado) {
        procesados++;
        if (resp.logros_ganados && resp.logros_ganados.length > 0) {
          logrosGanados.push(...resp.logros_ganados);
        }
      }
    } catch (err: any) {
      console.error("[Frontend] Error enviando evento de progreso:", err);
      ultimoError = err.message;
    }
  }

  return { procesados, error: ultimoError, logros_ganados: logrosGanados };
}

export type RegistrarEventoProgresoBody = {
  evento_id_cliente: string;
  tipo_evento: string;
  tema_id?: string;
  paso_id?: string;
  actividad_id?: string;
  correcta?: boolean;
  puntaje?: number;
  xp_otorgada?: number;
  datos?: Record<string, unknown>;
  ocurrido_en_cliente?: string;
  dispositivo_id?: string;
};

export type RegistrarEventoProgresoRespuesta =
  | {
      duplicado: false;
      evento: unknown;
      logros_ganados?: Array<{
        id: string;
        nombre: string;
        codigo: string;
        descripcion: string | null;
        bono_xp: number;
        url_icono: string | null;
      }>;
    }
  | {
      duplicado: true;
      mensaje: string;
    };

export function registrarEventoProgreso(datos: RegistrarEventoProgresoBody) {
  return peticion<RegistrarEventoProgresoRespuesta>("/progreso/eventos", {
    metodo: "POST",
    cuerpo: datos,
  });
}

/**
 * Obtiene el historial y resumen de progreso acumulado del usuario autenticado.
 * 
 * HTTP Verb: GET
 * Endpoint: /progreso/mi
 * Auth: Requerido
 */
export async function obtenerMiProgreso(): Promise<ProgresoResumen> {
  const respuesta = await obtenerMiProgresoConFallbackOffline();

  return normalizarProgresoResumen(respuesta);
}

export function normalizarProgresoResumen(respuesta: Awaited<ReturnType<typeof obtenerMiProgresoConFallbackOffline>>): ProgresoResumen {
  return {
    progresos_tema: respuesta.progresos_tema.map((progreso) => ({
      tema_id: progreso.tema_id,
      estado: progreso.estado === "completado" ? "completado" : "en_progreso",
      porcentaje: progreso.porcentaje,
      iniciado_en: progreso.iniciado_en,
      completado_en: progreso.completado_en,
      ultimo_paso_id: progreso.ultimo_paso_id,
    })),
    progresos_actividad: respuesta.progresos_actividad.map((progreso) => ({
      actividad_id: progreso.actividad_id,
      intentos: progreso.intentos,
      mejor_puntaje: progreso.mejor_puntaje,
      completado: progreso.completado,
    })),
  };
}
