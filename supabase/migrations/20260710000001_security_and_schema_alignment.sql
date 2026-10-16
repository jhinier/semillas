ALTER TABLE public.usuario_app
  ADD COLUMN IF NOT EXISTS token_invitado_hash text;

-- Alinea el esquema con Drizzle y bloquea el acceso directo desde el navegador.
-- La arquitectura de Semillas define a Hono (service_role) como único escritor/lector.

ALTER TABLE public.recurso_multimedia
  ADD COLUMN IF NOT EXISTS activo boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS actualizado_en timestamptz NOT NULL DEFAULT now();

UPDATE public.perfil
SET tamano_texto_preferido = CASE tamano_texto_preferido
  WHEN 'small' THEN 'pequeno'
  WHEN 'medium' THEN 'mediano'
  WHEN 'large' THEN 'grande'
  ELSE tamano_texto_preferido
END
WHERE tamano_texto_preferido IN ('small', 'medium', 'large');

DO $$
DECLARE
  restriccion record;
BEGIN
  FOR restriccion IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.perfil'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%tamano_texto_preferido%'
  LOOP
    EXECUTE format('ALTER TABLE public.perfil DROP CONSTRAINT %I', restriccion.conname);
  END LOOP;
END $$;

ALTER TABLE public.perfil
  ALTER COLUMN tamano_texto_preferido SET DEFAULT 'mediano',
  ADD CONSTRAINT perfil_tamano_texto_preferido_check
    CHECK (tamano_texto_preferido IN ('pequeno', 'mediano', 'grande'));

DO $$
DECLARE
  tabla record;
BEGIN
  FOR tabla IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tabla.tablename);
  END LOOP;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT USAGE ON SCHEMA public TO service_role;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
  END IF;
END $$;

-- Evitar que reintentos con nuevos UUID otorguen XP repetidamente.
WITH recompensas_repetidas AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY usuario_id, actividad_id
           ORDER BY recibido_en_servidor, id
         ) AS numero
  FROM evento_progreso
  WHERE actividad_id IS NOT NULL AND xp_otorgada > 0
)
UPDATE evento_progreso evento
SET xp_otorgada = 0
FROM recompensas_repetidas repetida
WHERE evento.id = repetida.id AND repetida.numero > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_evento_progreso_recompensa_actividad
  ON evento_progreso(usuario_id, actividad_id)
  WHERE actividad_id IS NOT NULL AND xp_otorgada > 0;
