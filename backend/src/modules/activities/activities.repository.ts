import { and, asc, eq, sql } from "drizzle-orm";
import type { DbClient } from "../../db/client";
import { schema } from "../../db/client";
import { evaluarYDesbloquearLogros } from "../gamification/gamification-awards";

type RegistroEventoProgreso = {
  usuarioId: string;
  idEventoCliente: string;
  actividadId: string;
  temaId: string;
  correcta: boolean;
  xpOtorgada: number;
  puntaje: number;
  datos: Record<string, unknown>;
  ocurridoEnCliente: Date;
  dispositivoId: string | null;
};

export function crearActivitiesRepository(db: DbClient) {
  return {
    async listarActividades() {
      const filasActividades = await db
        .select({ actividad: schema.actividad })
        .from(schema.actividad)
        .innerJoin(schema.tema, eq(schema.actividad.temaId, schema.tema.id))
        .where(eq(schema.tema.estado, "publicado"))
        .orderBy(asc(schema.actividad.orden));
      const actividades = filasActividades.map((fila) => fila.actividad);
      const tipos = await db.select().from(schema.tipoActividad);
      const opciones = await db.select().from(schema.opcionActividad);

      return { actividades, tipos, opciones };
    },

    async obtenerActividadConTipoYOpciones(actividadId: string) {
      const [filaActividad] = await db
        .select({ actividad: schema.actividad })
        .from(schema.actividad)
        .innerJoin(schema.tema, eq(schema.actividad.temaId, schema.tema.id))
        .where(and(eq(schema.actividad.id, actividadId), eq(schema.tema.estado, "publicado")))
        .limit(1);

      const actividad = filaActividad?.actividad;
      if (!actividad) return null;

      const [tipoActividad] = await db
        .select()
        .from(schema.tipoActividad)
        .where(eq(schema.tipoActividad.id, actividad.tipoActividadId))
        .limit(1);

      const opciones = await db
        .select()
        .from(schema.opcionActividad)
        .where(eq(schema.opcionActividad.actividadId, actividad.id))
        .orderBy(asc(schema.opcionActividad.orden));

      return { actividad, tipoActividad: tipoActividad ?? null, opciones };
    },

    async obtenerActividadParaRespuesta(actividadId: string) {
      const [actividad] = await db
        .select({
          id: schema.actividad.id,
          temaId: schema.actividad.temaId,
          xpRecompensa: schema.actividad.xpRecompensa,
          tipoCodigo: schema.tipoActividad.codigo
        })
        .from(schema.actividad)
        .innerJoin(schema.tema, eq(schema.actividad.temaId, schema.tema.id))
        .innerJoin(schema.tipoActividad, eq(schema.actividad.tipoActividadId, schema.tipoActividad.id))
        .where(and(eq(schema.actividad.id, actividadId), eq(schema.tema.estado, "publicado")))
        .limit(1);

      return actividad ?? null;
    },

    async obtenerOpcionDeActividad(actividadId: string, opcionId: string) {
      const [opcion] = await db
        .select({
          id: schema.opcionActividad.id,
          correcta: schema.opcionActividad.correcta,
          retroalimentacion: schema.opcionActividad.retroalimentacion
        })
        .from(schema.opcionActividad)
        .where(sql`${schema.opcionActividad.id} = ${opcionId} and ${schema.opcionActividad.actividadId} = ${actividadId}`)
        .limit(1);

      return opcion ?? null;
    },

    async obtenerOpcionCorrecta(actividadId: string) {
      const [opcion] = await db
        .select({
          id: schema.opcionActividad.id,
          retroalimentacion: schema.opcionActividad.retroalimentacion
        })
        .from(schema.opcionActividad)
        .where(sql`${schema.opcionActividad.actividadId} = ${actividadId} and ${schema.opcionActividad.correcta} = true`)
        .limit(1);

      return opcion ?? null;
    },

    async registrarEventoProgreso(evento: RegistroEventoProgreso) {
      const [registro] = await db
        .insert(schema.eventoProgreso)
        .values({
          usuarioId: evento.usuarioId,
          idEventoCliente: evento.idEventoCliente,
          tipoEvento: "actividad_respondida",
          temaId: evento.temaId,
          actividadId: evento.actividadId,
          correcta: evento.correcta,
          puntaje: evento.puntaje,
          xpOtorgada: evento.xpOtorgada,
          datos: evento.datos,
          ocurridoEnCliente: evento.ocurridoEnCliente,
          dispositivoId: evento.dispositivoId
        })
        .onConflictDoNothing()
        .returning();

      return registro ?? null;
    },

    async upsertProgresoActividad(usuarioId: string, actividadId: string, correcta: boolean) {
      await db
        .insert(schema.progresoActividadUsuario)
        .values({
          usuarioId,
          actividadId,
          intentos: 1,
          mejorPuntaje: correcta ? 100 : 0,
          completado: correcta,
          completadoEn: correcta ? new Date() : null,
          actualizadoEn: new Date()
        })
        .onConflictDoUpdate({
          target: [schema.progresoActividadUsuario.usuarioId, schema.progresoActividadUsuario.actividadId],
          set: {
            intentos: sql`${schema.progresoActividadUsuario.intentos} + 1`,
            mejorPuntaje: sql`greatest(${schema.progresoActividadUsuario.mejorPuntaje}, ${correcta ? 100 : 0})`,
            completado: sql`${schema.progresoActividadUsuario.completado} or ${correcta}`,
            completadoEn: correcta ? new Date() : sql`${schema.progresoActividadUsuario.completadoEn}`,
            actualizadoEn: new Date()
          }
        });
    },

    async upsertProgresoTema(usuarioId: string, temaId: string) {
      await db
        .insert(schema.progresoTemaUsuario)
        .values({
          usuarioId,
          temaId,
          estado: "en_progreso",
          porcentaje: 0,
          actualizadoEn: new Date()
        })
        .onConflictDoUpdate({
          target: [schema.progresoTemaUsuario.usuarioId, schema.progresoTemaUsuario.temaId],
          set: {
            estado: sql`case when ${schema.progresoTemaUsuario.estado} = 'completado' then ${schema.progresoTemaUsuario.estado} else 'en_progreso' end`,
            porcentaje: sql`greatest(${schema.progresoTemaUsuario.porcentaje}, 0)`,
            actualizadoEn: new Date()
          }
        });
    },

    async evaluarLogrosUsuario(usuarioId: string) {
      return evaluarYDesbloquearLogros(db, usuarioId);
    }
  };
}

export type ActivitiesRepository = ReturnType<typeof crearActivitiesRepository>;
