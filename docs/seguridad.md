# Seguridad operativa

**Owner:** M7 · **Revisión:** 2026-07-13

## Secretos y conexiones

- Las credenciales de Supabase y la conexión PostgreSQL viven únicamente en
  secretos del entorno de ejecución o en `backend/.dev.vars`, que no se versiona.
- `backend/wrangler.toml` declara el binding Hyperdrive, pero no contiene una
  `localConnectionString`.
- `SUPABASE_SERVICE_ROLE_KEY` solo se usa en el Worker; nunca se expone al
  frontend ni se escribe en logs.

Antes de desplegar, configurar los secretos con Wrangler y rotarlos si aparecen
en un commit, log o captura. La prueba `tests/seguridad-configuracion.test.ts`
bloquea conexiones PostgreSQL con usuario y contraseña en los archivos de
configuración versionados.

## RLS y Storage

Las migraciones habilitan RLS en las tablas públicas y revocan permisos de
`anon` y `authenticated`; `service_role` es el único rol con acceso operativo.
El bucket `media` es privado y el backend emite URLs firmadas. Las comprobaciones
SQL reproducibles están en `supabase/tests/rls_backend_only.test.sql` y
`supabase/tests/storage_privado.test.sql`.

## Clubes y reportes

No existe chat libre. Un miembro de un club activo puede reportar con una
categoría cerrada y detalle limitado; el backend aplica un máximo de cinco
reportes por hora por denunciante. Solo un administrador puede consultar y
resolver reportes, y la creación/resolución queda en `registro_auditoria`.
Los listados públicos de miembros usan `miembro_token`, un token opaco de
membresía; nunca entregan `usuario_id`, correo, edad ni nombre real.
