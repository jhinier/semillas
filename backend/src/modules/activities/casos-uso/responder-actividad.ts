import type { AuthUser } from "../../../config/env";
import { BadRequestError, NotFoundError } from "../../../shared/errors/http-error";
import type { ActivitiesRepository } from "../activities.repository";

type Dependencias = {
  actividades: ActivitiesRepository;
};

type EntradaResponderActividad = {
  evento_id_cliente: string;
  opcion_id_seleccionada?: string;
  texto_respuesta?: string;
  completada?: true;
  ocurrido_en_cliente?: string;
  dispositivo_id?: string;
};

export function crearCasoResponderActividad({ actividades }: Dependencias) {
  return async function responderActividad(
    usuario: AuthUser,
    actividadId: string,
    entrada: EntradaResponderActividad
  ) {
    const actividad = await actividades.obtenerActividadParaRespuesta(actividadId);

    if (!actividad) {
      throw new NotFoundError("Actividad no encontrada");
    }

    const esFinalizacionGuiada = entrada.completada === true;
    if (esFinalizacionGuiada && actividad.tipoCodigo === "cuestionario") {
      throw new BadRequestError("Los cuestionarios deben enviarse con una opción de respuesta");
    }

    if (entrada.texto_respuesta) {
      throw new BadRequestError("Esta actividad todavía no admite respuestas de texto verificables");
    }

    let opcion: Awaited<ReturnType<ActivitiesRepository["obtenerOpcionDeActividad"]>> | null = null;
    let opcionCorrecta: Awaited<ReturnType<ActivitiesRepository["obtenerOpcionCorrecta"]>> | null = null;

    if (entrada.opcion_id_seleccionada) {
      opcion = await actividades.obtenerOpcionDeActividad(actividadId, entrada.opcion_id_seleccionada);
      if (!opcion) throw new NotFoundError("Opción no encontrada");
      opcionCorrecta = await actividades.obtenerOpcionCorrecta(actividadId);
    } else if (!esFinalizacionGuiada) {
      throw new BadRequestError("Envía una opción o marca la actividad como completada");
    }

    const correcta = esFinalizacionGuiada || Boolean(opcion?.correcta);
    const xpOtorgada = correcta ? Number(actividad.xpRecompensa ?? 0) : 0;
    const retroalimentacion = opcion?.retroalimentacion ?? opcionCorrecta?.retroalimentacion ?? null;

    const evento = await actividades.registrarEventoProgreso({
      usuarioId: usuario.id,
      idEventoCliente: entrada.evento_id_cliente,
      actividadId,
      temaId: actividad.temaId,
      correcta,
      xpOtorgada,
      puntaje: correcta ? 100 : 0,
      datos: {
        opcion_id_seleccionada: entrada.opcion_id_seleccionada ?? null,
        texto_respuesta: entrada.texto_respuesta ?? null,
        completada: esFinalizacionGuiada
      },
      ocurridoEnCliente: entrada.ocurrido_en_cliente ? new Date(entrada.ocurrido_en_cliente) : new Date(),
      dispositivoId: entrada.dispositivo_id ?? null
    });

    if (!evento) {
      return {
        resultado: {
          correcta,
          xp_otorgada: 0,
          opcion_correcta_id: opcionCorrecta?.id ?? null,
          retroalimentacion
        },
        duplicado: true,
        correcta,
        xp_otorgada: 0,
        logros_desbloqueados: [],
      };
    }

    await actividades.upsertProgresoActividad(usuario.id, actividadId, correcta);

    let logrosDesbloqueados: Array<{ id: string; codigo: string; nombre: string; bonoXp: number }> = [];
    if (correcta) {
      await actividades.upsertProgresoTema(usuario.id, actividad.temaId);
      logrosDesbloqueados = await actividades.evaluarLogrosUsuario(usuario.id);
    }

    return {
      resultado: {
        correcta,
        xp_otorgada: xpOtorgada,
        opcion_correcta_id: opcionCorrecta?.id ?? null,
        retroalimentacion
      },
      duplicado: false,
      correcta,
      xp_otorgada: xpOtorgada,
      logros_desbloqueados: logrosDesbloqueados.map((logro) => ({
        id: logro.id,
        codigo: logro.codigo,
        nombre: logro.nombre,
        bono_xp: logro.bonoXp,
      })),
    };
  };
}
