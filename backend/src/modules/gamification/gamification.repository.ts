import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { DbClient } from "../../db/client";
import { schema } from "../../db/client";
import { reclamarLogro } from "./gamification-awards";
import { calcularRachaDiaria } from "./racha.service";

export type GamificationRepository = ReturnType<typeof crearGamificationRepository>;

export function crearGamificationRepository(db: DbClient) {
  return {
    async obtenerNivelUsuario(usuarioId: string) {
      const level = await db.execute(sql`
        select usuario_id, xp_total, numero_nivel, nombre_nivel
        from v_nivel_usuario
        where usuario_id = ${usuarioId}
        limit 1
      `);

      return Array.isArray(level) ? level[0] ?? null : (level as unknown as Array<Record<string, unknown>>)[0] ?? null;
    },

    async listarReglasNivel() {
      return db.select().from(schema.reglaNivel).orderBy(desc(schema.reglaNivel.xpMinima));
    },

    async obtenerRachaUsuario(usuarioId: string) {
      const filas = await db
        .select({ dia: sql<string>`(${schema.eventoProgreso.recibidoEnServidor} at time zone 'America/Guayaquil')::date::text` })
        .from(schema.eventoProgreso)
        .where(and(
          eq(schema.eventoProgreso.usuarioId, usuarioId),
          inArray(schema.eventoProgreso.tipoEvento, ["tema_completado", "actividad_respondida"]),
          sql`(${schema.eventoProgreso.tipoEvento} = 'tema_completado' or ${schema.eventoProgreso.correcta} = true)`,
        ))
        .groupBy(sql`(${schema.eventoProgreso.recibidoEnServidor} at time zone 'America/Guayaquil')::date`)
        .orderBy(desc(sql`(${schema.eventoProgreso.recibidoEnServidor} at time zone 'America/Guayaquil')::date`))
        .limit(366);
      return calcularRachaDiaria(filas.map((fila) => fila.dia));
    },

    async listarLogrosUsuario(usuarioId: string) {
      return db
        .select({
          usuario_id: schema.logroUsuario.usuarioId,
          logro_id: schema.logroUsuario.logroId,
          ganado_en: schema.logroUsuario.ganadoEn,
          reclamado_en: schema.logroUsuario.reclamadoEn,
          logro: schema.logro
        })
        .from(schema.logroUsuario)
        .leftJoin(schema.logro, eq(schema.logroUsuario.logroId, schema.logro.id))
        .where(eq(schema.logroUsuario.usuarioId, usuarioId));
    },

    async reclamarLogro(usuarioId: string, logroId: string) {
      return reclamarLogro(db, usuarioId, logroId);
    },

    async contarLogrosPendientesReclamar(usuarioId: string): Promise<number> {
      const [resultado] = await db
        .select({ total: sql<number>`count(*)::int` })
        .from(schema.logroUsuario)
        .where(
          sql`${schema.logroUsuario.usuarioId} = ${usuarioId} AND ${schema.logroUsuario.reclamadoEn} IS NULL`
        )
        .limit(1);
      return Number(resultado?.total ?? 0);
    }
  };
}
