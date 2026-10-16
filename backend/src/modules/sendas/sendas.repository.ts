import { asc, eq } from "drizzle-orm";
import type { DbClient } from "../../db/client";
import { schema } from "../../db/client";

type SendasRepositoryDb = DbClient;

export function crearSendasRepository(db: SendasRepositoryDb) {
  return {
    async listarActivas() {
      return db
        .select()
        .from(schema.senda)
        .where(eq(schema.senda.activo, true))
        .orderBy(asc(schema.senda.orden));
    }
  };
}
