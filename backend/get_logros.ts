import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "./src/db/client";

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  const logros = await db.select().from(schema.logro);
  console.log("Logros en BD:");
  console.table(logros.map(l => ({ nombre: l.nombre, codigo: l.codigo, criterio: l.codigoCriterio, valor: l.valorCriterio, bono_xp: l.bonoXp })));
  process.exit(0);
}
main();
