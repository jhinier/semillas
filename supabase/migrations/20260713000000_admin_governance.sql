ALTER TABLE revision_contenido
  ADD COLUMN IF NOT EXISTS notas_envio text,
  ADD COLUMN IF NOT EXISTS notas_revision text;

UPDATE revision_contenido
SET notas_envio = notas
WHERE notas_envio IS NULL AND notas IS NOT NULL;

CREATE OR REPLACE FUNCTION sincronizar_notas_revision_contenido()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.notas_revision IS NOT NULL THEN
    NEW.notas := NEW.notas_revision;
  ELSIF NEW.notas_envio IS NOT NULL THEN
    NEW.notas := NEW.notas_envio;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sincronizar_notas_revision_contenido_trigger ON revision_contenido;
CREATE TRIGGER sincronizar_notas_revision_contenido_trigger
BEFORE INSERT OR UPDATE OF notas, notas_envio, notas_revision ON revision_contenido
FOR EACH ROW EXECUTE FUNCTION sincronizar_notas_revision_contenido();

INSERT INTO configuracion_plataforma (clave, categoria, valor, descripcion)
VALUES
  ('administracion.nombre_plataforma', 'administracion', to_jsonb('Semillas'::text), 'Nombre administrativo de la plataforma.'),
  ('administracion.correo_soporte', 'administracion', 'null'::jsonb, 'Correo de soporte de la plataforma.'),
  ('administracion.zona_horaria', 'administracion', to_jsonb('America/Guayaquil'::text), 'Zona horaria de referencia.'),
  ('administracion.notas_obligatorias_cambios', 'administracion', 'true'::jsonb, 'Exige notas al solicitar cambios.'),
  ('administracion.notas_obligatorias_rechazo', 'administracion', 'true'::jsonb, 'Exige motivo al rechazar contenido.')
ON CONFLICT (clave) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_revision_contenido_estado_creado_en
  ON revision_contenido (estado, creado_en DESC);

CREATE OR REPLACE VIEW v_admin_revisiones
WITH (security_invoker = true)
AS
SELECT
  revision.id,
  revision.tema_id,
  revision.estado,
  revision.notas_envio,
  revision.notas_revision,
  revision.creado_en,
  revision.revisado_en,
  tema.titulo,
  senda.nombre AS senda,
  enviado.nombre_visible AS enviado_por,
  revisado.nombre_visible AS revisado_por
FROM revision_contenido AS revision
JOIN tema ON tema.id = revision.tema_id
JOIN senda ON senda.id = tema.senda_id
LEFT JOIN usuario_app AS enviado ON enviado.id = revision.enviado_por
LEFT JOIN usuario_app AS revisado ON revisado.id = revision.revisado_por;

REVOKE ALL ON v_admin_revisiones FROM anon, authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT SELECT ON v_admin_revisiones TO service_role;
  END IF;
END;
$$;
