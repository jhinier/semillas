import type { SyncRepository } from "../sync.repository";
import type { SyncPushEvent } from "../sync.schemas";
import { crearSyncUnitOfWork } from "../sync.unit-of-work";

type Dependencias = {
  repositorio: SyncRepository;
};
type LogroSync = { id: string; codigo: string; nombre: string; bono_xp: number };

function sanitizarEvento(evento: SyncPushEvent): SyncPushEvent {
  return {
    ...evento,
    correcta: undefined,
    puntaje: undefined,
    xp_otorgada: 0,
  };
}

export function crearCasoProcesarSyncPush({ repositorio }: Dependencias) {
  return async function procesarSyncPush(usuarioId: string, eventos: SyncPushEvent[]) {
    const unidadDeTrabajo = crearSyncUnitOfWork(repositorio);
    const procesados_ids: string[] = [];
    const omitidos_ids: string[] = [];
    const errores: { evento_id_cliente: string; error: string }[] = [];
    const logrosDesbloqueados = new Map<string, { id: string; codigo: string; nombre: string; bono_xp: number }>();

    for (const eventoRecibido of eventos) {
      try {
        let evento = sanitizarEvento(eventoRecibido);
        let respuestaValidada:
          | { actividadId: string; temaId: string; correcta: boolean }
          | null = null;
        let actividadCompletadaValidada:
          | { actividadId: string; temaId: string }
          | null = null;
        let completarTema = false;

        if (evento.tipo_evento === "actividad_respondida") {
          const actividadId = evento.actividad_id;
          const opcionId = typeof evento.datos?.opcion_id_seleccionada === "string"
            ? evento.datos.opcion_id_seleccionada
            : null;

          if (!actividadId || !opcionId) {
            throw new Error("La respuesta offline no contiene actividad y opción válidas");
          }

          const validacion = await repositorio.validarRespuestaActividad(actividadId, opcionId);
          if (!validacion) {
            throw new Error("La actividad u opción ya no está disponible");
          }

          evento = {
            ...evento,
            tema_id: validacion.temaId,
            correcta: validacion.correcta,
            puntaje: validacion.correcta ? 100 : 0,
            xp_otorgada: validacion.xpOtorgada,
            datos: {
              ...evento.datos,
              opcion_correcta_id: validacion.opcionCorrectaId,
              validado_en_servidor: true,
            },
          };
          respuestaValidada = {
            actividadId,
            temaId: validacion.temaId,
            correcta: validacion.correcta,
          };
        }

        if (evento.tipo_evento === "actividad_completada") {
          const actividadId = evento.actividad_id;
          if (!actividadId) {
            throw new Error("La actividad completada no contiene una actividad válida");
          }

          const validacion = await repositorio.validarActividadCompletada(actividadId);
          if (!validacion) {
            throw new Error("La actividad ya no está disponible");
          }

          evento = {
            ...evento,
            tema_id: validacion.temaId,
            correcta: true,
            puntaje: 100,
            xp_otorgada: validacion.xpOtorgada,
            datos: {
              ...evento.datos,
              validado_en_servidor: true,
            },
          };
          actividadCompletadaValidada = {
            actividadId,
            temaId: validacion.temaId,
          };
        }

        if (evento.tipo_evento === "tema_completado" && evento.tema_id) {
          const validacion = await repositorio.validarTemaCompletable(usuarioId, evento.tema_id);
          if (!validacion) {
            throw new Error("El tema todavía no cumple las condiciones para completarse");
          }
          evento = { ...evento, xp_otorgada: validacion.xpOtorgada, puntaje: 100 };
          completarTema = true;
        }

        const resultado = await unidadDeTrabajo.ejecutar(async (repo) => {
          const insertado = await repo.registrarEvento(usuarioId, evento);
          if (!insertado) return { insertado: false, logros: [] as LogroSync[] };

          const logros: LogroSync[] = [];

          if (respuestaValidada) {
            await repo.aplicarRespuestaActividad(
              usuarioId,
              respuestaValidada.actividadId,
              respuestaValidada.temaId,
              respuestaValidada.correcta,
            );
          }

          if (actividadCompletadaValidada) {
            await repo.aplicarActividadCompletada(
              usuarioId,
              actividadCompletadaValidada.actividadId,
              actividadCompletadaValidada.temaId,
            );
          }

          if (
            (evento.tipo_evento === "bloque_iniciado" || evento.tipo_evento === "bloque_completado") &&
            evento.tema_id &&
            evento.paso_id
          ) {
            await repo.registrarPasoActual(usuarioId, evento.tema_id, evento.paso_id);
          }

          if (completarTema && evento.tema_id) {
            await repo.marcarTemaCompletado(usuarioId, evento.tema_id);
          }

          if (completarTema || (respuestaValidada?.correcta ?? false)) {
            const nuevosLogros = await repo.evaluarLogrosUsuario(usuarioId);
            for (const logro of nuevosLogros) {
              logros.push({ id: logro.id, codigo: logro.codigo, nombre: logro.nombre, bono_xp: logro.bonoXp });
            }
          }

          if (evento.tipo_evento === "tema_iniciado" && evento.tema_id) {
            const existente = await repo.obtenerProgresoTema(usuarioId, evento.tema_id);
            const ahora = new Date();
            const inicioCliente = evento.creado_en_cliente ? new Date(evento.creado_en_cliente) : ahora;
            const inicio = Number.isNaN(inicioCliente.getTime()) || inicioCliente > ahora ? ahora : inicioCliente;

            if (!existente) {
              await repo.crearProgresoTema(usuarioId, evento.tema_id, {
                estado: "en_progreso", porcentaje: 0, iniciadoEn: inicio, completadoEn: null, actualizadoEn: ahora,
              });
            } else if (!existente.iniciadoEn) {
              await repo.actualizarProgresoTema(usuarioId, evento.tema_id, {
                estado: "en_progreso", iniciadoEn: inicio, actualizadoEn: ahora,
              });
            }
          }

          return { insertado: true, logros };
        });

        if (!resultado.insertado) {
          omitidos_ids.push(evento.evento_id_cliente);
          continue;
        }

        procesados_ids.push(evento.evento_id_cliente);
        for (const logro of resultado.logros) {
          logrosDesbloqueados.set(logro.id, logro);
        }
      } catch (error) {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        errores.push({ evento_id_cliente: eventoRecibido.evento_id_cliente, error: mensaje });
      }
    }

    return {
      procesados: procesados_ids.length,
      omitidos: omitidos_ids.length,
      procesados_ids,
      omitidos_ids,
      errores,
      logros_desbloqueados: [...logrosDesbloqueados.values()],
    };
  };
}
