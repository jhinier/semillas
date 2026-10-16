ALTER TABLE senda ADD COLUMN IF NOT EXISTS imagen_recurso_id uuid REFERENCES recurso_multimedia(id) ON DELETE SET NULL;
