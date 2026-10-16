# Baseline de cierre G0: dev2

## Captura única

- UTC: `2026-07-13T16:47:59Z`.
- SHA de referencia: `5061a96db998792087c6b6392769fd9b1dafb722`.
- `git rev-parse HEAD`: `5061a96db998792087c6b6392769fd9b1dafb722`.
- HEAD final: `5061a96db998792087c6b6392769fd9b1dafb722`.
- Verificación de identidad: el HEAD inicial y el final coinciden; todos los resultados de esta tabla corresponden al mismo SHA de referencia.
- Bun: `1.3.10`.
- Supabase CLI: `2.109.1`.
- Wrangler: `4.110.0`.

## Estado del trabajo

Salida capturada de `git status --short --branch`:

```text
## dev2...origin/dev2
 M backend/src/db/database.types.ts
 M backend/src/db/schema.ts
 M backend/src/modules/admin/admin.repository.ts
 M backend/src/modules/admin/admin.routes.test.ts
 M backend/src/modules/admin/admin.schemas.ts
 M backend/src/shared/middleware/auth.middleware.ts
 M semilla_base.sql
 M supabase/migrations/20260713000000_admin_governance.sql
```

Salida capturada de `git log --oneline -10`:

```text
5061a96d fix(logros): surface reclaim achievement error with toast
36393c23 club adminitracion
bf7d141e fix: surface backend redirects in login
4847e417 club adminitracion
01ab28eb fix: surface remaining frontend errors
d419984e docs: document api worker csp
6b2377ec Se agrego el CSP del dominio de clouflare
5a33ba75 admin modulo de media
61dc627c admin se agrego mas builders de actividades y pantallas de reporte, ajuste y ajuste de usuarios
84c39745 admin CMS de media, usuarios y actividades
```

## Ejecución

| Comando | SHA | Resultado | Evidencia resumida |
| --- | --- | --- | --- |
| `bun install --frozen-lockfile` | `5061a96db998792087c6b6392769fd9b1dafb722` | PASS | Verificó 826 instalaciones en 1062 paquetes, sin cambios. |
| `bun run --cwd backend typecheck` | `5061a96db998792087c6b6392769fd9b1dafb722` | PASS | `tsc --noEmit` finalizó con código 0. |
| `bun run --cwd frontend typecheck` | `5061a96db998792087c6b6392769fd9b1dafb722` | PASS | `tsc --noEmit` finalizó con código 0. |
| `bun run test:backend` | `5061a96db998792087c6b6392769fd9b1dafb722` | PASS | 145 tests pass, 0 fail, 361 `expect()` en 36 archivos. |
| `bun run test:frontend` | `5061a96db998792087c6b6392769fd9b1dafb722` | PASS | 556 tests pass, 0 fail, 1058 `expect()` en 98 archivos. |
| `bun run test:contrato` | `5061a96db998792087c6b6392769fd9b1dafb722` | PASS | 156 tests pass, 0 fail, 156 `expect()` en un archivo. |
| `bun run test:e2e` | `5061a96db998792087c6b6392769fd9b1dafb722` | PASS | El script ejecutó `bun test test --pass-with-no-tests`: 145 tests pass, 0 fail, 361 `expect()` en 36 archivos. |
| `bun run build` | `5061a96db998792087c6b6392769fd9b1dafb722` | PASS | Frontend Vite/PWA y backend `tsc --noEmit` finalizaron con código 0. |

## Matriz de clasificación de gates baseline

| Comando baseline | Resultado | Clasificación |
| --- | --- | --- |
| `bun run --cwd backend typecheck` | PASS | sin fallos — no aplica |
| `bun run --cwd frontend typecheck` | PASS | sin fallos — no aplica |
| `bun run test:backend` | PASS | sin fallos — no aplica |
| `bun run test:frontend` | PASS | sin fallos — no aplica |
| `bun run test:contrato` | PASS | sin fallos — no aplica |
| `bun run test:e2e` | PASS | sin fallos — no aplica |
| `bun run build` | PASS | sin fallos — no aplica |

## Advertencias reales no bloqueantes

- El build informó que `frontend/src/routes/login.test.tsx` y `frontend/src/routes/auth.callback.test.tsx` están bajo el directorio de rutas y no exportan `Route`; no se incluyen en el árbol de rutas.
- Vite informó chunks mayores de 500 kB tras minificación. La PWA se generó con 240 entradas precacheadas (66883.33 KiB).

No hubo comandos fallidos durante esta captura. Los errores impresos por pruebas de middleware y autorización corresponden a escenarios esperados por los tests, que finalizaron con 0 fallos.

## Restricción aplicada

La captura no mostró variables de entorno ni secretos. No se modificaron archivos funcionales, no se ejecutó `git add` ni `git commit`.
