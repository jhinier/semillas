import { and, desc, eq, gte, sql } from "drizzle-orm";
import { schema, type DbClient } from "../../db/client";
import type { SyncPushEvent } from "./sync.schemas";
import { evaluarYDesbloquearLogros, type LogroDesbloqueado } from "../gamification/gamification-awards";

export type FilaEventoSincronizacion = {
  id: string;
  usuarioId: string;
  idEventoCliente: string;
  tipoEvento: string;
  temaId: string | null;
  pasoId: string | null;
  actividadId: string | null;
  correcta: boolean | null;
  puntaje: number | null;
  xpOtorgada: number;
  datos: unknown;
  ocurridoEnCliente: Date;
  dispositivoId: string | null;
  recibidoEnServidor: Date;
};

export type FilaProgresoTemaSincronizacion = {
  usuarioId: string;
  temaId: string;
  estado: string;
  porcentaje: number;
  iniciadoEn: Date | null;
  completadoEn: Date | null;
  ultimoPasoId: string | null;
  actualizadoEn: Date;
};

export type FilaProgresoActividadSincronizacion = {
  usuarioId: string;
  actividadId: string;
  intentos: number;
  mejorPuntaje: number;
  completado: boolean;
  completadoEn: Date | null;
  actualizadoEn: Date;
};

export interface SyncRepository {
  ejecutarAtomico?<T>(operacion: (repositorio: SyncRepository) => Promise<T>): Promise<T>;
  listarEventosUsuario(usuarioId: string, since?: string): Promise<FilaEventoSincronizacion[]>;
  listarProgresoTemas(usuarioId: string): Promise<FilaProgresoTemaSincronizacion[]>;
  listarProgresoActividades(usuarioId: string): Promise<FilaProgresoActividadSincronizacion[]>;
  registrarEvento(usuarioId: string, evento: SyncPushEvent): Promise<boolean>;
  obtenerProgresoTema(usuarioId: string, temaId: string): Promise<FilaProgresoTemaSincronizacion | undefined>;
  crearProgresoTema(
    usuarioId: string,
    temaId: string,
    datos: {
      estado: "en_progreso" | "completado";
      porcentaje: number;
      iniciadoEn: Date;
      completadoEn: Date | null;
      actualizadoEn: Date;
    }
  ): Promise<void>;
  actualizarProgresoTema(
    usuarioId: string,
    temaId: string,
    datos: {
      estado?: "en_progreso" | "completado";
      porcentaje?: number;
      iniciadoEn?: Date;
      completadoEn?: Date | null;
      actualizadoEn: Date;
    }
  ): Promise<void>;
  obtenerProgresoActividad(usuarioId: string, actividadId: string): Promise<FilaProgresoActividadSincronizacion | undefined>;
  crearProgresoActividad(
    usuarioId: string,
    actividadId: string,
    datos: {
      intentos: number;
      mejorPuntaje: number;
      completado: boolean;
      completadoEn: Date | null;
      actualizadoEn: Date;
    }
  ): Promise<void>;
  actualizarProgresoActividad(
    usuarioId: string,
    actividadId: string,
    datos: {
      intentos?: number;
      mejorPuntaje?: number;
      completado?: boolean;
      completadoEn?: Date | null;
      actualizadoEn: Date;
    }
  ): Promise<void>;
  validarRespuestaActividad(actividadId: string, opcionId: string): Promise<{
    temaId: string;
    correcta: boolean;
    xpOtorgada: number;
    opcionCorrectaId: string | null;
  } | null>;
  aplicarRespuestaActividad(
    usuarioId: string,
    actividadId: string,
    temaId: string,
    correcta: boolean,
  ): Promise<void>;
  validarActividadCompletada(actividadId: string): Promise<{
    temaId: string;
    xpOtorgada: number;
  } | null>;
  aplicarActividadCompletada(
    usuarioId: string,
    actividadId: string,
    temaId: string,
  ): Promise<void>;
  registrarPasoActual(usuarioId: string, temaId: string, pasoId: string): Promise<void>;
  validarTemaCompletable(usuarioId: string, temaId: string): Promise<{ xpOtorgada: number } | null>;
  marcarTemaCompletado(usuarioId: string, temaId: string): Promise<void>;
  evaluarLogrosUsuario(usuarioId: string): Promise<LogroDesbloqueado[]>;
}

type Dependencias = {
  db: DbClient;
};

function normalizarFechaCliente(fecha?: string) {
  const ahora = new Date();
  if (!fecha) return ahora;
  const candidata = new Date(fecha);
  if (Number.isNaN(candidata.getTime()) || candidata > ahora) return ahora;
  return candidata;
}

export function crearSyncRepository({ db }: Dependencias): SyncRepository {
  return {
    async listarEventosUsuario(usuarioId: string, since?: string) {
      const consultaBase = db
        .select()
        .from(schema.eventoProgreso)
        .where(eq(schema.eventoProgreso.usuarioId, usuarioId))
        .orderBy(desc(schema.eventoProgreso.recibidoEnServidor));

      if (!since) return consultaBase;

      return db
        .select()
        .from(schema.eventoProgreso)
        .where(and(eq(schema.eventoProgreso.usuarioId, usuarioId), gte(schema.eventoProgreso.recibidoEnServidor, new Date(since))))
        .orderBy(desc(schema.eventoProgreso.recibidoEnServidor));
    },

    async listarProgresoTemas(usuarioId: string) {
      return db.select().from(schema.progresoTemaUsuario).where(eq(schema.progresoTemaUsuario.usuarioId, usuarioId));
    },

    async listarProgresoActividades(usuarioId: string) {
      return db.select().from(schema.progresoActividadUsuario).where(eq(schema.progresoActividadUsuario.usuarioId, usuarioId));
    },

    async registrarEvento(usuarioId: string, evento: SyncPushEvent) {
      const [nuevo] = await db
        .insert(schema.eventoProgreso)
        .values({
          usuarioId,
          idEventoCliente: evento.evento_id_cliente,
          tipoEvento: evento.tipo_evento,
          temaId: evento.tema_id ?? null,
          pasoId: evento.paso_id ?? null,
          actividadId: evento.actividad_id ?? null,
          correcta: evento.correcta ?? null,
          puntaje: evento.puntaje ?? null,
          xpOtorgada: evento.xp_otorgada ?? 0,
          datos: evento.datos,
          ocurridoEnCliente: normalizarFechaCliente(evento.creado_en_cliente),
          dispositivoId: evento.dispositivo_id ?? null
        })
        .onConflictDoNothing()
        .returning();

      return Boolean(nuevo);
    },

    async obtenerProgresoTema(usuarioId: string, temaId: string) {
      const [fila] = await db
        .select()
        .from(schema.progresoTemaUsuario)
        .where(and(eq(schema.progresoTemaUsuario.usuarioId, usuarioId), eq(schema.progresoTemaUsuario.temaId, temaId)))
        .limit(1);

      return fila;
    },

    async crearProgresoTema(
      usuarioId: string,
      temaId: string,
      datos: {
        estado: "en_progreso" | "completado";
        porcentaje: number;
        iniciadoEn: Date;
        completadoEn: Date | null;
        actualizadoEn: Date;
      }
    ) {
      await db.insert(schema.progresoTemaUsuario).values({
        usuarioId,
        temaId,
        estado: datos.estado,
        porcentaje: datos.porcentaje,
        iniciadoEn: datos.iniciadoEn,
        completadoEn: datos.completadoEn,
        actualizadoEn: datos.actualizadoEn
      });
    },

    async actualizarProgresoTema(
      usuarioId: string,
      temaId: string,
      datos: {
        estado?: "en_progreso" | "completado";
        porcentaje?: number;
        iniciadoEn?: Date;
        completadoEn?: Date | null;
        actualizadoEn: Date;
      }
    ) {
      await db
        .update(schema.progresoTemaUsuario)
        .set({
          ...(datos.estado ? { estado: datos.estado } : {}),
          ...(datos.porcentaje !== undefined ? { porcentaje: datos.porcentaje } : {}),
          ...(datos.iniciadoEn ? { iniciadoEn: datos.iniciadoEn } : {}),
          ...(datos.completadoEn !== undefined ? { completadoEn: datos.completadoEn } : {}),
          actualizadoEn: datos.actualizadoEn
        })
        .where(and(eq(schema.progresoTemaUsuario.usuarioId, usuarioId), eq(schema.progresoTemaUsuario.temaId, temaId)));
    },

    async obtenerProgresoActividad(usuarioId: string, actividadId: string) {
      const [fila] = await db
        .select()
        .from(schema.progresoActividadUsuario)
        .where(and(eq(schema.progresoActividadUsuario.usuarioId, usuarioId), eq(schema.progresoActividadUsuario.actividadId, actividadId)))
        .limit(1);

      return fila;
    },

    async crearProgresoActividad(
      usuarioId: string,
      actividadId: string,
      datos: {
        intentos: number;
        mejorPuntaje: number;
        completado: boolean;
        completadoEn: Date | null;
        actualizadoEn: Date;
      }
    ) {
      await db.insert(schema.progresoActividadUsuario).values({
        usuarioId,
        actividadId,
        intentos: datos.intentos,
        mejorPuntaje: datos.mejorPuntaje,
        completado: datos.completado,
        completadoEn: datos.completadoEn,
        actualizadoEn: datos.actualizadoEn
      });
    },

    async actualizarProgresoActividad(
      usuarioId: string,
      actividadId: string,
      datos: {
        intentos?: number;
        mejorPuntaje?: number;
        completado?: boolean;
        completadoEn?: Date | null;
        actualizadoEn: Date;
      }
    ) {
      await db
        .update(schema.progresoActividadUsuario)
        .set({
          ...(datos.intentos !== undefined ? { intentos: datos.intentos } : {}),
          ...(datos.mejorPuntaje !== undefined ? { mejorPuntaje: datos.mejorPuntaje } : {}),
          ...(datos.completado !== undefined ? { completado: datos.completado } : {}),
          ...(datos.completadoEn !== undefined ? { completadoEn: datos.completadoEn } : {}),
          actualizadoEn: datos.actualizadoEn
        })
        .where(and(eq(schema.progresoActividadUsuario.usuarioId, usuarioId), eq(schema.progresoActividadUsuario.actividadId, actividadId)));
    },

    async validarRespuestaActividad(actividadId: string, opcionId: string) {
      const [fila] = await db
        .select({
          temaId: schema.actividad.temaId,
          xpRecompensa: schema.actividad.xpRecompensa,
          opcionId: schema.opcionActividad.id,
          correcta: schema.opcionActividad.correcta,
        })
        .from(schema.actividad)
        .innerJoin(
          schema.opcionActividad,
          and(
            eq(schema.opcionActividad.actividadId, schema.actividad.id),
            eq(schema.opcionActividad.id, opcionId),
          ),
        )
        .where(eq(schema.actividad.id, actividadId))
        .limit(1);

      if (!fila) return null;

      const [correcta] = await db
        .select({ id: schema.opcionActividad.id })
        .from(schema.opcionActividad)
        .where(and(
          eq(schema.opcionActividad.actividadId, actividadId),
          eq(schema.opcionActividad.correcta, true),
        ))
        .limit(1);

      return {
        temaId: fila.temaId,
        correcta: Boolean(fila.correcta),
        xpOtorgada: fila.correcta ? Number(fila.xpRecompensa ?? 0) : 0,
        opcionCorrectaId: correcta?.id ?? null,
      };
    },

    async aplicarRespuestaActividad(usuarioId, actividadId, temaId, correcta) {
      const ahora = new Date();
      await db
        .insert(schema.progresoActividadUsuario)
        .values({
          usuarioId,
          actividadId,
          intentos: 1,
          mejorPuntaje: correcta ? 100 : 0,
          completado: correcta,
          completadoEn: correcta ? ahora : null,
          actualizadoEn: ahora,
        })
        .onConflictDoUpdate({
          target: [schema.progresoActividadUsuario.usuarioId, schema.progresoActividadUsuario.actividadId],
          set: {
            intentos: sql`${schema.progresoActividadUsuario.intentos} + 1`,
            mejorPuntaje: sql`greatest(${schema.progresoActividadUsuario.mejorPuntaje}, ${correcta ? 100 : 0})`,
            completado: sql`${schema.progresoActividadUsuario.completado} or ${correcta}`,
            completadoEn: correcta ? ahora : sql`${schema.progresoActividadUsuario.completadoEn}`,
            actualizadoEn: ahora,
          },
        });

      await db
        .insert(schema.progresoTemaUsuario)
        .values({
          usuarioId,
          temaId,
          estado: "en_progreso",
          porcentaje: 0,
          iniciadoEn: ahora,
          actualizadoEn: ahora,
        })
        .onConflictDoUpdate({
          target: [schema.progresoTemaUsuario.usuarioId, schema.progresoTemaUsuario.temaId],
          set: {
            estado: sql`case when ${schema.progresoTemaUsuario.estado} = 'completado' then ${schema.progresoTemaUsuario.estado} else 'en_progreso' end`,
            actualizadoEn: ahora,
          },
      });
    },

    async validarActividadCompletada(actividadId) {
      const [actividad] = await db
        .select({
          temaId: schema.actividad.temaId,
          xpRecompensa: schema.actividad.xpRecompensa,
        })
        .from(schema.actividad)
        .where(eq(schema.actividad.id, actividadId))
        .limit(1);

      if (!actividad) return null;
      return {
        temaId: actividad.temaId,
        xpOtorgada: Number(actividad.xpRecompensa ?? 0),
      };
    },

    async aplicarActividadCompletada(usuarioId, actividadId, temaId) {
      const ahora = new Date();
      await db
        .insert(schema.progresoActividadUsuario)
        .values({
          usuarioId,
          actividadId,
          intentos: 1,
          mejorPuntaje: 100,
          completado: true,
          completadoEn: ahora,
          actualizadoEn: ahora,
        })
        .onConflictDoUpdate({
          target: [schema.progresoActividadUsuario.usuarioId, schema.progresoActividadUsuario.actividadId],
          set: {
            intentos: sql`${schema.progresoActividadUsuario.intentos} + 1`,
            mejorPuntaje: sql`greatest(${schema.progresoActividadUsuario.mejorPuntaje}, 100)`,
            completado: true,
            completadoEn: ahora,
            actualizadoEn: ahora,
          },
        });

      await db
        .insert(schema.progresoTemaUsuario)
        .values({
          usuarioId,
          temaId,
          estado: "en_progreso",
          porcentaje: 0,
          iniciadoEn: ahora,
          actualizadoEn: ahora,
        })
        .onConflictDoUpdate({
          target: [schema.progresoTemaUsuario.usuarioId, schema.progresoTemaUsuario.temaId],
          set: {
            estado: sql`case when ${schema.progresoTemaUsuario.estado} = 'completado' then ${schema.progresoTemaUsuario.estado} else 'en_progreso' end`,
            actualizadoEn: ahora,
          },
        });
    },

    async registrarPasoActual(usuarioId, temaId, pasoId) {
      const [paso] = await db
        .select({ orden: schema.pasoTema.orden })
        .from(schema.pasoTema)
        .where(and(eq(schema.pasoTema.id, pasoId), eq(schema.pasoTema.temaId, temaId)))
        .limit(1);
      if (!paso) return;

      const [total] = await db
        .select({ total: sql<number>`count(*)::int` })
        .from(schema.pasoTema)
        .where(eq(schema.pasoTema.temaId, temaId));
      const porcentaje = Math.min(95, Math.max(0, Math.round((paso.orden / Math.max(1, total?.total ?? 1)) * 100)));
      const ahora = new Date();

      await db
        .insert(schema.progresoTemaUsuario)
        .values({
          usuarioId,
          temaId,
          estado: "en_progreso",
          porcentaje,
          ultimoPasoId: pasoId,
          iniciadoEn: ahora,
          actualizadoEn: ahora,
        })
        .onConflictDoUpdate({
          target: [schema.progresoTemaUsuario.usuarioId, schema.progresoTemaUsuario.temaId],
          set: {
            estado: "en_progreso",
            porcentaje,
            ultimoPasoId: pasoId,
            actualizadoEn: ahora,
          },
        });
    },

    async validarTemaCompletable(usuarioId, temaId) {
      const [tema] = await db
        .select({ xpRecompensa: schema.tema.xpRecompensa })
        .from(schema.tema)
        .where(eq(schema.tema.id, temaId))
        .limit(1);
      if (!tema) return null;

      const [conteos] = await db
        .select({
          total: sql<number>`count(${schema.actividad.id})::int`,
          completadas: sql<number>`count(${schema.progresoActividadUsuario.actividadId}) filter (where ${schema.progresoActividadUsuario.completado} = true)::int`,
        })
        .from(schema.actividad)
        .leftJoin(
          schema.progresoActividadUsuario,
          and(
            eq(schema.progresoActividadUsuario.actividadId, schema.actividad.id),
            eq(schema.progresoActividadUsuario.usuarioId, usuarioId),
          ),
        )
        .where(eq(schema.actividad.temaId, temaId));

      const total = Number(conteos?.total ?? 0);
      const completadas = Number(conteos?.completadas ?? 0);
      if (total > 0 && completadas < total) return null;

      return { xpOtorgada: Number(tema.xpRecompensa ?? 0) };
    },

    async marcarTemaCompletado(usuarioId, temaId) {
      const ahora = new Date();
      await db
        .insert(schema.progresoTemaUsuario)
        .values({
          usuarioId,
          temaId,
          estado: "completado",
          porcentaje: 100,
          iniciadoEn: ahora,
          completadoEn: ahora,
          actualizadoEn: ahora,
        })
        .onConflictDoUpdate({
          target: [schema.progresoTemaUsuario.usuarioId, schema.progresoTemaUsuario.temaId],
          set: {
            estado: "completado",
            porcentaje: 100,
            completadoEn: ahora,
            actualizadoEn: ahora,
          },
        });
    },

    async evaluarLogrosUsuario(usuarioId) {
      return evaluarYDesbloquearLogros(db, usuarioId);
    },

    async ejecutarAtomico<T>(operacion: (repositorio: SyncRepository) => Promise<T>) {
      return db.transaction(async (tx) => operacion(crearSyncRepository({ db: tx as unknown as DbClient })));
    },
  };
}
