# Evidencia de automatización G8

Estado: workflow preparado; ejecución remota pendiente de configurar los
GitHub Environments.

## Flujo staging

`develop` ejecuta instalación reproducible con Bun, typecheck, tests, build,
documentación, budgets, cobertura, smoke y PWA. Antes de aplicar migraciones:

1. Instala `postgresql-client` en el runner.
2. Crea el backup remoto con `backup:db`.
3. Crea el backup de Storage con `backup:storage`.
4. Verifica ambos manifest y checksums con `restore:verify`.
5. Guarda el backup como artifact retenido.
6. Enlaza el proyecto remoto con `supabase link` y ejecuta `db push --linked`.
7. Despliega Worker, Pages y ejecuta smoke remoto.

## Flujo producción

`main` usa el GitHub Environment `production`, cuya protección requiere la
aprobación configurada en GitHub. Repite backup, verificación y migraciones
compatibles, pero descarga y promueve el mismo artifact PWA generado en
staging (`semillas-frontend-<STAGING_COMMIT_SHA>`) mediante
`STAGING_ARTIFACT_RUN_ID`; después despliega Worker, Pages y smoke con variables
del entorno de producción.

## Restricciones

- No se ejecuta `supabase start`, `supabase db reset` ni Docker.
- No se imprimen `SUPABASE_*`, tokens de Cloudflare ni URLs privadas.
- La PWA se publica como `frontend/dist`; no se genera APK.
- El smoke de producción solo consulta endpoints no destructivos.
- El rollback automatizado está restringido a staging y exige un Worker version
  ID y un artifact anterior identificable por SHA.

La lista de variables está en [`../../operacion/entornos.md`](../../operacion/entornos.md).
