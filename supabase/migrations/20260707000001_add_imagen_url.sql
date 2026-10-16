-- La columna se conserva para medios remotos opcionales, pero la PWA utiliza
-- ilustraciones locales como fallback y no depende de un proyecto Supabase fijo.
ALTER TABLE grupo_edad ADD COLUMN IF NOT EXISTS imagen_url text;
