import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "./src/db/client";

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  const rules = await db.select().from(schema.reglaNivel).orderBy(schema.reglaNivel.numeroNivel);
  console.log("Niveles:");
  console.table(rules);
  process.exit(0);
}
main();
