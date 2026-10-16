ALTER TABLE logro_usuario
  ADD COLUMN IF NOT EXISTS reclamado_en TIMESTAMPTZ;

-- Los logros previos ya recibieron su XP antes de introducir el reclamo manual.
UPDATE logro_usuario
SET reclamado_en = ganado_en
WHERE reclamado_en IS NULL;
