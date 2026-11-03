import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Configura DATABASE_URL en el archivo .env antes de ejecutar este script (o ejecuta supabase/migrations/20260715000000_correcciones_rama_mateo.sql en el SQL Editor de Supabase).",
  );
}

async function run() {
  console.log("=== Aplicando correcciones de base de datos (Rama_Mateo) en Supabase ===");
  const sqlPath = resolve(
    import.meta.dirname ?? __dirname,
    "../supabase/migrations/20260715000000_correcciones_rama_mateo.sql",
  );
  const script = readFileSync(sqlPath, "utf-8");

  const sql = postgres(databaseUrl, { max: 1 });
  try {
    await sql.unsafe(script);
    console.log("✓ Las 3 Sendas (Padre, Hijo y Espíritu Santo) con sus 6 pasos CRECER para las 3 franjas de edad e insignias fueron actualizadas correctamente.");
  } finally {
    await sql.end();
  }
}

run().catch((err) => {
  console.error("Error ejecutando el script:", err);
  process.exit(1);
});
