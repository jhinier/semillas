import { peticion } from "../../shared/api/api";
import type { Actividad, EventoProgreso } from "../../shared/api/api";
import { obtenerActividadLocalPorServerId } from "@/lib/offline/offline-read";
import { enviarEventosProgreso } from "@/features/progress/progress.api";

export type ResponderActividadInput = {
  evento_id_cliente: string;
  opcion_id_seleccionada?: string;
  texto_respuesta?: string;
  completada?: true;
  ocurrido_en_cliente?: string;
  dispositivo_id?: string;
};

export async function obtenerActividad(idActividad: string) {
  if (!navigator.onLine) {
    const local = await obtenerActividadLocalPorServerId(idActividad);
    if (!local) throw new Error("Esta actividad no está descargada para usarla sin conexión.");
    return local;
  }

  try {
    return await peticion<Actividad>(`/actividades/${idActividad}`, { autenticar: false });
  } catch (error) {
    const local = await obtenerActividadLocalPorServerId(idActividad);
    if (local) return local;
    throw error;
  }
}

export function obtenerActividades() {
  return peticion<Actividad[]>("/actividades");
}

export async function responderActividad(idActividad: string, datos: ResponderActividadInput) {
  if (navigator.onLine) {
    try {
      return await peticion<{
        resultado: {
          correcta: boolean;
          xp_otorgada: number;
          opcion_correcta_id: string | null;
          retroalimentacion: string | null;
        };
        duplicado: boolean;
      }>(`/actividades/${idActividad}/responder`, {
        metodo: "POST",
        cuerpo: datos,
      });
    } catch (error) {
      const local = await obtenerActividadLocalPorServerId(idActividad);
      if (!local) throw error;
      return responderLocalmente(local, datos);
    }
  }

  const local = await obtenerActividadLocalPorServerId(idActividad);
  if (!local) throw new Error("Descarga este tema antes de responder actividades sin conexión.");
  return responderLocalmente(local, datos);
}

async function responderLocalmente(actividad: Actividad, datos: ResponderActividadInput) {
  const esFinalizacionGuiada = datos.completada === true;
  const seleccionada = datos.opcion_id_seleccionada
    ? actividad.opciones.find((opcion) => opcion.id === datos.opcion_id_seleccionada)
    : null;

  if (!esFinalizacionGuiada && !seleccionada) {
    throw new Error("Selecciona una opción válida.");
  }

  const correcta = esFinalizacionGuiada || Boolean(seleccionada?.correcta);
  const opcionCorrecta = actividad.opciones.find((opcion) => opcion.correcta);
  const evento: EventoProgreso = {
    evento_id_cliente: datos.evento_id_cliente,
    tipo_evento: "actividad_respondida",
    tema_id: actividad.tema_id || undefined,
    actividad_id: actividad.id,
    correcta,
    puntaje: correcta ? 100 : 0,
    xp_otorgada: 0,
    ocurrido_en_cliente: datos.ocurrido_en_cliente ?? new Date().toISOString(),
    dispositivo_id: datos.dispositivo_id,
    datos: {
      opcion_id_seleccionada: datos.opcion_id_seleccionada ?? null,
      texto_respuesta: datos.texto_respuesta ?? null,
      completada: esFinalizacionGuiada,
      resultado_provisional_offline: true,
    },
  };

  await enviarEventosProgreso([evento]);

  return {
    resultado: {
      correcta,
      xp_otorgada: 0,
      opcion_correcta_id: opcionCorrecta?.id ?? null,
      retroalimentacion:
        seleccionada?.retroalimentacion ??
        opcionCorrecta?.retroalimentacion ??
        actividad.retroalimentacion,
    },
    duplicado: false,
    offline: true,
  };
}
