# Backup y restore

El backup de base y Storage se conserva fuera de Git, con fecha, proyecto,
migración aplicada, conteos y checksum. El restore se ejecuta primero en un
proyecto limpio con `ON_ERROR_STOP=1`; después se valida RLS, bucket privado,
conteos y smoke de API.

Objetivos iniciales: RPO ≤ 24 horas y RTO ≤ 4 horas. Registrar duración real y
resultado en `docs/evidencias/G8/`.

## Automatización

Los scripts no contienen URLs ni credenciales por defecto:

```bash
SUPABASE_PROJECT_REF=... \
SUPABASE_DATABASE_URL=... \
BACKUP_DIR=backups/2026-07-13 \
bun run backup:db

SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
BACKUP_DIR=backups/2026-07-13 \
bun run backup:storage
```

El backup DB usa `pg_dump`/`pg_dumpall` directamente contra la URL remota; no
usa Supabase local ni Docker. Genera `schema.sql`, `data.sql`, `roles.sql` y
`manifest.json` con SHA-256. Storage genera `storage-manifest.json` y conserva
los objetos fuera de Git. Antes de restaurar se verifican todos los checksums:

```bash
SUPABASE_DATABASE_URL=... BACKUP_DIR=backups/2026-07-13 bun run restore:db
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
BACKUP_DIR=backups/2026-07-13 bun run restore:storage
```

La ejecución real contra un proyecto limpio/staging aún debe registrarse como
evidencia de G8.

Para verificar ambos manifiestos sin tocar ningún servicio:

```bash
BACKUP_DIR=backups/2026-07-13 bun run restore:verify
```
