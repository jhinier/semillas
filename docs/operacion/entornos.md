# Entornos

| Entorno | Frontend | API | Datos |
|---|---|---|---|
| Local | Vite | Wrangler local | Supabase remoto de desarrollo |
| Preview | Pages preview | Worker preview | proyecto de prueba |
| Staging | `staging.semillas.pages.dev` | Worker staging | Supabase staging |
| Producción | `semillas.org` | Worker production | Supabase producción |

Cada entorno tiene sus propios secretos, redirects OAuth y binding Hyperdrive.
El owner de infraestructura registra nombres/tipos de bindings, nunca valores.

## Variables protegidas de CI/CD

Las siguientes variables se configuran en GitHub Environments `staging` y
`production`; sus valores nunca se escriben en el repositorio ni en logs:

| Tipo | Variables/secretos |
|---|---|
| Cloudflare | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CF_PAGES_PROJECT_NAME` |
| Supabase | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Frontend | `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| Smoke | `STAGING_API_URL`, `STAGING_FRONTEND_URL`, `PRODUCTION_API_URL`, `PRODUCTION_FRONTEND_URL` |
| Promoción de artifact en producción | `STAGING_ARTIFACT_RUN_ID`, `STAGING_COMMIT_SHA` |

Antes de `db push`, el workflow enlaza explícitamente el checkout con el
proyecto remoto usando `supabase link --project-ref ... --skip-pooler`; después
ejecuta `supabase db push --linked`. La instancia local solo apunta al proyecto
remoto de desarrollo y no requiere Docker, `supabase start` ni una base local.

Producción no recompila el frontend para publicar una variante distinta:
descarga `semillas-frontend-<STAGING_COMMIT_SHA>` desde la ejecución de staging
indicada por `STAGING_ARTIFACT_RUN_ID` y promueve ese mismo artifact después de
la aprobación del Environment.
