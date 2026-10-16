/**
 * ============================================================
 * CONFIGURACIÓN DE DRIZZLE ORM - SEMILLAS
 * ============================================================
 *
 * Este archivo configura Drizzle Kit para la gestión de migraciones
 * y desarrollo del esquema de base de datos.
 *
 * COMANDOS DISPONIBLES:
 * - bun run db:generate  → Genera archivos de migración SQL
 * - bun run db:migrate   → Ejecuta migraciones pendientes
 * - bun run db:push      → Hace push del esquema directamente (dev)
 * - bun run db:studio    → Abre Drizzle Studio (GUI)
 * - bun run db:check     → Verifica diferencias entre schema y DB
 *
 * @see https://orm.drizzle.team/docs/drizzle-kit
 */

import { defineConfig } from "drizzle-kit";

function requerirEntorno(nombre: string, valor: string | undefined): string {
  const normalizado = valor?.trim();
  if (!normalizado) {
    throw new Error(`[semillas] Falta la variable de entorno ${nombre}`);
  }
  return normalizado;
}

export default defineConfig({
  // Ruta al archivo de esquema de Drizzle
  schema: "./src/db/schema.ts",

  // Carpeta donde se guardan las migraciones generadas
  out: "./drizzle",

  // Dialecto de la base de datos
  dialect: "postgresql",

  // Conexión a la base de datos (usada por drizzle-kit)
  // Usar variable de entorno SUPABASE_DATABASE_URL
  // Ejemplo: postgresql://user:password@host:5432/dbname
  dbCredentials: {
    url: requerirEntorno("SUPABASE_DATABASE_URL", process.env.SUPABASE_DATABASE_URL)
  },

  verbose: true,
  strict: true
});
