-- El navegador nunca accede directamente a Storage: Hono emite URLs firmadas.
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'media',
  'media',
  false,
  52428800,
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp',
    'audio/mpeg', 'audio/aac', 'audio/ogg', 'audio/webm',
    'video/mp4', 'video/webm',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
