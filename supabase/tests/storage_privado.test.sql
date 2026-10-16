BEGIN;
SELECT plan(3);

SELECT ok((SELECT NOT public FROM storage.buckets WHERE id = 'media'), 'bucket media es privado');
SELECT ok((SELECT file_size_limit = 52428800 FROM storage.buckets WHERE id = 'media'), 'bucket media limita tamaño');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'storage.objects'::regclass), 'Storage objects tiene RLS');

SELECT * FROM finish();
ROLLBACK;
