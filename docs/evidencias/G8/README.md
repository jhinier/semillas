# Evidencia del Gate G8

Estado: pendiente de staging, producción, smoke, rollback y aprobación formal.
No se declara release hasta completar la matriz y firmar la desviación PWA.

## Automatización preparada

`bun test scripts/smoke.test.ts` valida health, OpenAPI, catálogo, sendas,
autorización administrativa, media privada, headers de seguridad, landing,
deep-link, manifest y service worker con un fetch controlado. El smoke real se
ejecuta con:

```bash
SMOKE_API_URL=https://api.example.test \
SMOKE_FRONTEND_URL=https://semillas.example.test \
bun run smoke
```

La ejecución contra staging y producción sigue pendiente porque requiere las
URLs y credenciales del entorno remoto. Los workflows `deploy.yml` y
`smoke.yml` ya parametrizan esas variables sin imprimir secretos.

La promoción de producción requiere `STAGING_ARTIFACT_RUN_ID` y
`STAGING_COMMIT_SHA` para reutilizar el artifact PWA aprobado en staging, en
lugar de recompilar una variante diferente.

También están disponibles `backup:db`, `restore:db`, `backup:storage` y
`restore:storage`, con manifiestos y validación SHA-256. Falta ejecutar un
simulacro real en un proyecto limpio. `backup:db` usa `pg_dump`/`pg_dumpall`
contra `SUPABASE_DATABASE_URL`, sin Supabase local ni Docker.
