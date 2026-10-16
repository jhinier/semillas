import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import type { DbClient } from "../../db/client";
import { schema } from "../../db/client";

export type AdminLogrosRepository = ReturnType<typeof crearAdminLogrosRepository>;

type FiltrosListado = {
  q?: string;
  activo?: boolean;
  criterio?: "temas_completados" | "actividades_completadas" | "dias_racha";
  limit: number;
  offset: number;
};

export function crearAdminLogrosRepository(db: DbClient) {
  async function obtenerLogro(id: string) {
    const [fila] = await db
      .select()
      .from(schema.logro)
      .where(eq(schema.logro.id, id))
      .limit(1);
    return fila ?? null;
  }

  return {
    async listar(filtros: FiltrosListado) {
      const condiciones = [];
      if (filtros.q) {
        condiciones.push(sql`(${schema.logro.nombre} ILIKE ${`%${filtros.q}%`} OR ${schema.logro.codigo} ILIKE ${`%${filtros.q}%`})`);
      }
      if (filtros.activo !== undefined) condiciones.push(eq(schema.logro.activo, filtros.activo));
      if (filtros.criterio) condiciones.push(eq(schema.logro.codigoCriterio, filtros.criterio));

      const where = condiciones.length > 0 ? and(...condiciones) : undefined;

      const [filas, [conteo]] = await Promise.all([
        db
          .select({
            id: schema.logro.id,
            codigo: schema.logro.codigo,
            nombre: schema.logro.nombre,
            descripcion: schema.logro.descripcion,
            urlIcono: schema.logro.urlIcono,
            bonoXp: schema.logro.bonoXp,
            codigoCriterio: schema.logro.codigoCriterio,
            valorCriterio: schema.logro.valorCriterio,
            activo: schema.logro.activo,
            creadoEn: schema.logro.creadoEn,
            otorgados: sql<number>`(SELECT COUNT(*)::int FROM ${schema.logroUsuario} WHERE ${schema.logroUsuario.logroId} = ${schema.logro.id})`,
          })
          .from(schema.logro)
          .where(where)
          .orderBy(desc(schema.logro.creadoEn))
          .limit(filtros.limit)
          .offset(filtros.offset),
        db
          .select({ total: sql<number>`count(*)::int` })
          .from(schema.logro)
          .where(where)
          .limit(1),
      ]);

      return { filas, total: Number(conteo?.total ?? 0) };
    },

    async listarOrdenadoPorNombre(filtros: Omit<FiltrosListado, "limit" | "offset">) {
      const condiciones = [];
      if (filtros.q) {
        condiciones.push(sql`(${schema.logro.nombre} ILIKE ${`%${filtros.q}%`} OR ${schema.logro.codigo} ILIKE ${`%${filtros.q}%`})`);
      }
      if (filtros.activo !== undefined) condiciones.push(eq(schema.logro.activo, filtros.activo));
      if (filtros.criterio) condiciones.push(eq(schema.logro.codigoCriterio, filtros.criterio));
      const where = condiciones.length > 0 ? and(...condiciones) : undefined;
      return db
        .select({
          id: schema.logro.id,
          codigo: schema.logro.codigo,
          nombre: schema.logro.nombre,
        })
        .from(schema.logro)
        .where(where)
        .orderBy(asc(schema.logro.nombre));
    },

    async obtener(id: string) {
      return obtenerLogro(id);
    },

    async buscarPorCodigo(codigo: string) {
      const [fila] = await db
        .select({ id: schema.logro.id })
        .from(schema.logro)
        .where(eq(schema.logro.codigo, codigo))
        .limit(1);
      return fila ?? null;
    },

    async crear(input: {
      codigo: string;
      nombre: string;
      descripcion: string | null;
      urlIcono: string | null;
      bonoXp: number;
      codigoCriterio: string;
      valorCriterio: number;
    }) {
      const [fila] = await db
        .insert(schema.logro)
        .values({
          codigo: input.codigo,
          nombre: input.nombre,
          descripcion: input.descripcion,
          urlIcono: input.urlIcono,
          bonoXp: input.bonoXp,
          codigoCriterio: input.codigoCriterio,
          valorCriterio: input.valorCriterio,
        })
        .returning();
      return fila;
    },

    async actualizar(
      id: string,
      input: Partial<{
        nombre: string;
        descripcion: string | null;
        urlIcono: string | null;
        bonoXp: number;
        codigoCriterio: string;
        valorCriterio: number;
      }>,
    ) {
      const parcial: Record<string, unknown> = {};
      if (input.nombre !== undefined) parcial.nombre = input.nombre;
      if (input.descripcion !== undefined) parcial.descripcion = input.descripcion;
      if (input.urlIcono !== undefined) parcial.urlIcono = input.urlIcono;
      if (input.bonoXp !== undefined) parcial.bonoXp = input.bonoXp;
      if (input.codigoCriterio !== undefined) parcial.codigoCriterio = input.codigoCriterio;
      if (input.valorCriterio !== undefined) parcial.valorCriterio = input.valorCriterio;

      if (Object.keys(parcial).length === 0) {
        return obtenerLogro(id);
      }

      const [fila] = await db
        .update(schema.logro)
        .set(parcial)
        .where(eq(schema.logro.id, id))
        .returning();
      return fila ?? null;
    },

    async archivar(id: string) {
      const [fila] = await db
        .update(schema.logro)
        .set({ activo: false })
        .where(eq(schema.logro.id, id))
        .returning({ id: schema.logro.id, activo: schema.logro.activo });
      return fila ?? null;
    },

    async reactivar(id: string) {
      const [fila] = await db
        .update(schema.logro)
        .set({ activo: true })
        .where(eq(schema.logro.id, id))
        .returning({ id: schema.logro.id, activo: schema.logro.activo });
      return fila ?? null;
    },

    async contarOtorgados(id: string) {
      const [fila] = await db
        .select({ total: sql<number>`count(*)::int` })
        .from(schema.logroUsuario)
        .where(eq(schema.logroUsuario.logroId, id))
        .limit(1);
      return Number(fila?.total ?? 0);
    },
  };
}
