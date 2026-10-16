// Script para ejecutar la migración SQL de reclamado_en
// Uso: bun run scripts/migrar-reclamado-en.ts
import postgres from "postgres";

const DB_URL = process.env.SUPABASE_DATABASE_URL;

if (!DB_URL) {
  throw new Error("Configura SUPABASE_DATABASE_URL en el entorno; el script no contiene una conexión por defecto.");
}

const sql = postgres(DB_URL, { ssl: "require", prepare: false });

async function migrar() {
  console.log("▶ Iniciando migración: reclamado_en en logro_usuario...");

  // Paso 1: Agregar columna si no existe
  await sql`
    ALTER TABLE logro_usuario
    ADD COLUMN IF NOT EXISTS reclamado_en TIMESTAMPTZ
  `;
  console.log("✓ Columna reclamado_en agregada (o ya existía)");

  // Paso 2: Retrocompatibilidad — marcar logros ya existentes como reclamados
  const { count } = await sql`
    UPDATE logro_usuario
    SET reclamado_en = ganado_en
    WHERE reclamado_en IS NULL
    RETURNING count(*) AS count
  `.then(r => ({ count: r.length }));
  console.log(`✓ ${count} logros existentes marcados como reclamados (retrocompatibilidad)`);

  console.log("✅ Migración completada exitosamente.");
  await sql.end();
}

migrar().catch((err) => {
  console.error("❌ Error en migración:", err);
  process.exit(1);
});
