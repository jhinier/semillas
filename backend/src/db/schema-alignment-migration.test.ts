import { expect, test } from "bun:test";

const rutaMigracion = new URL("../../../supabase/migrations/20260714004506_reconcile_profile_progress.sql", import.meta.url);

test("la migracion correctiva alinea el perfil y el progreso existentes", async () => {
  const sql = await Bun.file(rutaMigracion).text();

  expect(sql).toContain("ADD COLUMN IF NOT EXISTS clave_avatar text");
  expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.progreso_tema_usuario");
  expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.progreso_actividad_usuario");
  expect(sql).toContain("ADD COLUMN IF NOT EXISTS actualizado_en timestamptz NOT NULL DEFAULT now()");
  expect(sql).toContain("uq_progreso_tema_usuario_usuario_tema");
  expect(sql).toContain("uq_progreso_actividad_usuario_usuario_actividad");
});
