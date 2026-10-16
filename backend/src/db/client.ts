/**
 * ============================================================
 * CLIENTE DE BASE DE DATOS - SEMILLAS
 * ============================================================
 *
 * Módulo que gestiona la conexión a la base de datos PostgreSQL
 * usando Drizzle ORM. Proporciona:
 *
 * 1. Cliente Drizzle (principal) - Para queries tipadas
 * 2. Clientes Supabase (legacy) - Para auth y storage
 *
 * ARQUITECTURA DE DATOS:
 *
 * Drizzle ORM se usa para:
 * - Queries SQL con tipado estático
 * - Joins complejos
 * - Migraciones de esquema
 * - Queries con autocompletado en IDE
 *
 * Supabase Client se mantiene para:
 * - Autenticación (createUser, etc.)
 * - Storage (upload, download, signed URLs)
 * - Edge Functions de Supabase
 * - RL Policies (consultas con auth.uid())
 *
 * @module db/client
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { Env } from "../config/env";
import * as schema from "./schema";

/**
 * ============================================================
 * CLIENTE DRIZZLE (PRINCIPAL)
 * ============================================================
 *
 * Cliente PostgreSQL configurado para usar con Drizzle ORM.
 * Se importa directamente en los módulos que necesitan acceso a DB.
 *
 * @example
 * // En un módulo
 * import { db, schema } from "../../db/client";
 *
 * const usuarios = await db
 *   .select()
 *   .from(schema.usuarioApp)
 *   .where(eq(schema.usuarioApp.activo, true));
 */

export function crearDb(env: Env) {
  const connectionString = env.HYPERDRIVE?.connectionString ?? env.SUPABASE_DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Configura HYPERDRIVE en Cloudflare o SUPABASE_DATABASE_URL para desarrollo local."
    );
  }

  const clientePostgres = postgres(connectionString, {
    prepare: false
  });

  return drizzle(clientePostgres, { schema });
}

// El cliente Drizzle se crea por solicitud a partir del entorno y se inyecta
// en los módulos. No se abre una conexión global implícita a localhost.

/**
 * ============================================================
 * CLIENTES SUPABASE (LEGACY)
 * ============================================================
 * Se mantienen por compatibilidad con código existente.
 * Gradualmente migrar a Drizzle donde sea posible.
 */

/**
 * Cliente admin de Supabase
 *
 * ⚠️ SOLO PARA USO EN BACKEND ⚠️
 * NUNCA exponer la service role key al frontend
 *
 * Capacidades:
 * - Crear usuarios (auth.admin.createUser)
 * - Gestión de storage
 * - Edge functions con privilegios de admin
 *
 * @param env - Variables de entorno con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 * @returns Cliente de Supabase con permisos de admin
 */
export function createSupabaseAdmin(env: Env) {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

/**
 * Cliente de Supabase autenticado
 *
 * Usa la anon key pero con el token Bearer del usuario.
 * Necesario para consultas que usan RL policies con auth.uid().
 *
 * @param env - Variables de entorno
 * @param accessToken - Token JWT del usuario
 * @returns Cliente de Supabase configurado con el token del usuario
 */
export function createSupabaseAuthClient(env: Env, accessToken: string) {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
}

/**
 * ============================================================
 * EXPORTS
 * ============================================================
 */

// Tipos del cliente Drizzle (para inyección de dependencias si se necesita)
export type DbClient = ReturnType<typeof crearDb>;

// Schema completo de la base de datos
// Usar para importar las tablas en los módulos
export { schema };

/**
 * ============================================================
 * NOTAS DE MIGRACIÓN
 * ============================================================
 *
 * Para migrar un módulo de Supabase a Drizzle:
 *
 * 1. Recibir el cliente Drizzle por inyección y usar schema desde este archivo
 * 2. Reemplazar Supabase queries con queries Drizzle
 * 3. Eliminar c.set("db") y c.get("db") del módulo
 * 4. Mantener el uso de Supabase client solo para:
 *    - Auth operations
 *    - Storage operations
 *    - Edge functions
 *
 * @example Migración de query
 *
 * // ANTES (Supabase)
 * const { data } = await db.from("usuarios").select("*");
 *
 * // DESPUÉS (Drizzle)
 * const usuarios = await db.select().from(schema.usuarioApp);
 *
 */
