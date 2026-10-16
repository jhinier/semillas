
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "./src/db/client";
import { eq } from "drizzle-orm";

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  const themes = await db.select({ id: schema.tema.id, titulo: schema.tema.titulo }).from(schema.tema);
  
  for (const t of themes) {
    const steps = await db.select().from(schema.pasoTema).where(eq(schema.pasoTema.temaId, t.id));
    console.log(`Tema: ${t.titulo} | Pasos: ${steps.length}`);
  }
  
  process.exit(0);
}

main();
