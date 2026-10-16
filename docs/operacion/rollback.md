# Rollback

El rollback automatizado solo admite **staging**. Producción requiere una
decisión formal y no se revierte de forma destructiva la base de datos.

## Procedimiento manual

1. Detén el despliegue y conserva logs/request IDs.
2. Identifica Worker version ID y artifact frontend anterior.
3. Ejecuta `bunx wrangler deployments status --env staging`.
4. Revierte solo el Worker aprobado y redeploya el artifact anterior.
5. Ejecuta smoke; no hagas rollback destructivo de DB en producción.
6. Si es necesario, restaura en proyecto limpio y cambia el binding tras validar.

## Workflow controlado

Ejecuta manualmente `.github/workflows/rollback.yml` con:

- `worker_version_id`: versión anterior del Worker staging.
- `artifact_run_id`: ejecución que contiene el artifact aprobado.
- `artifact_commit_sha`: SHA usado en `semillas-frontend-<SHA>`.

El workflow descarga el artifact, verifica PWA y budgets, ejecuta
`wrangler rollback` únicamente con `--env staging`, publica el frontend
anterior en la rama staging y ejecuta `smoke:staging`.

Registrar el resultado en
[`docs/evidencias/G8/rollback-staging.md`](../evidencias/G8/rollback-staging.md)
con duración, RTO, errores y responsable. Nunca incluir tokens ni URLs
privadas.
