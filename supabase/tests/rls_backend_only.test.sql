BEGIN;
SELECT plan(10);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.usuario_app'::regclass),
  'usuario_app tiene RLS habilitado'
);
SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.progreso_actividad_usuario'::regclass),
  'progreso tiene RLS habilitado'
);
SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.evento_progreso'::regclass),
  'eventos de progreso tienen RLS habilitado'
);
SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.registro_auditoria'::regclass),
  'auditoria tiene RLS habilitado'
);
SELECT ok(NOT has_table_privilege('anon', 'public.usuario_app', 'SELECT'), 'anon no puede leer usuarios');
SELECT ok(NOT has_table_privilege('authenticated', 'public.usuario_app', 'SELECT'), 'authenticated no puede leer usuarios');
SELECT ok(NOT has_table_privilege('anon', 'public.evento_progreso', 'INSERT'), 'anon no puede insertar eventos');
SELECT ok(NOT has_table_privilege('authenticated', 'public.evento_progreso', 'INSERT'), 'authenticated no puede insertar eventos');
SELECT ok(NOT has_table_privilege('anon', 'storage.objects', 'SELECT'), 'anon no puede leer Storage');
SELECT ok(NOT has_table_privilege('authenticated', 'storage.objects', 'INSERT'), 'authenticated no puede escribir Storage');

SELECT * FROM finish();
ROLLBACK;
