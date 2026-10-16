# Matriz final de trazabilidad

> Estado de cierre auditado el 2026-07-13. Esta matriz refleja evidencia local disponible; las filas `revalidar` y `brecha` no se consideran aceptación final hasta ejecutar sus gates externos.

## Resumen

- Requisitos: **59**
- Cumple con evidencia local: **9**
- Revalidar en gate/entorno: **38**
- Brecha pendiente: **11**
- Desviación acordada técnicamente, pendiente de firma: **1**

## Detalle

| ID | Gate | Estado | Pruebas | Evidencias |
|---|---|---|---|---|
| DESV-01 | G0-G8 | desviacion | `tests/e2e/pwa-installability.spec.ts`<br>`tests/e2e/pwa-offline.spec.ts` | `docs/entrega/desviaciones.md`<br>`docs/evidencias/G6/pwa.md` |
| ENT-01 | G6 | revalidar | `tests/e2e/pwa-installability.spec.ts`<br>`tests/e2e/pwa-offline.spec.ts` | `docs/evidencias/G6/pwa.md`<br>`docs/evidencias/G6/android-gama-baja.md` |
| ENT-02 | G8 | brecha | `scripts/smoke.test.ts` | `docs/evidencias/G8/README.md` |
| ENT-03 | G8 | revalidar | `tests/trazabilidad-requisitos.test.ts` | `README.md`<br>`docs/estado-docs.md` |
| ENT-04 | G7-G8 | brecha | `scripts/backup-supabase.test.ts`<br>`scripts/backup-storage.test.ts` | `docs/operacion/backup-restore.md`<br>`docs/evidencias/G7/README.md`<br>`docs/evidencias/G8/rollback-staging.md` |
| ENT-05 | G8 | revalidar | `scripts/smoke.test.ts` | `.github/workflows/deploy.yml`<br>`docs/evidencias/G8/workflow.md` |
| ENT-06 | G1-G7 | cumple | `tests/seguridad-configuracion.test.ts` | `backend/.env.example`<br>`frontend/.env.example`<br>`docs/operacion/entornos.md` |
| ENT-07 | G7 | cumple | `scripts/check-doc-links.test.ts` | `README.md`<br>`docs/estado-docs.md` |
| ENT-08 | G7-G8 | revalidar | `tests/e2e/smoke.spec.ts` | `docs/manual-usuario.md`<br>`docs/evidencias/G7/revision-tercero.md` |
| ENT-09 | G7-G8 | revalidar | `backend/src/modules/admin/admin.routes.test.ts` | `docs/manual-administrador.md`<br>`docs/cms.md`<br>`docs/evidencias/G7/revision-tercero.md` |
| ENT-10 | G7-G8 | revalidar | `scripts/check-doc-links.test.ts` | `docs/arquitectura.md`<br>`docs/estado-docs.md` |
| RF-01 | G2 | revalidar | `frontend/src/features/auth/migracion-invitado.test.ts` | `docs/evidencias/G2/README.md`<br>`docs/evidencias/G3/README.md` |
| RF-02 | G2 | revalidar | `frontend/src/features/auth/social-login.test.ts` | `docs/evidencias/G2/README.md`<br>`docs/auth/oauth-entornos.md` |
| RF-03 | G2 | brecha | `frontend/src/features/auth/social-login.test.ts` | `docs/evidencias/G2/README.md`<br>`docs/auth/oauth-entornos.md` |
| RF-04 | G2 | revalidar | `backend/src/modules/users/users.schemas.test.ts` | `docs/evidencias/G2/README.md` |
| RF-05 | G2 | revalidar | `backend/src/modules/users/users.schemas.test.ts`<br>`backend/src/modules/users/users.routes.test.ts` | `docs/evidencias/G2/README.md` |
| RF-06 | G2 | brecha | `frontend/src/features/auth/migracion-invitado.test.ts`<br>`backend/src/modules/auth/casos-uso/resolver-sesion.test.ts`<br>`backend/src/modules/users/casos-uso/vincular-cuenta.test.ts`<br>`frontend/src/routes/auth.callback.test.tsx`<br>`frontend/src/shared/auth/supabase.helpers.test.ts` | `docs/evidencias/G2/README.md` |
| RF-07 | G2 | revalidar | `backend/src/shared/middleware/auth.middleware.test.ts`<br>`backend/src/shared/middleware/role.middleware.test.ts`<br>`backend/test/app.e2e-spec.ts` | `docs/evidencias/G1/README.md`<br>`docs/evidencias/G2/README.md` |
| RF-08 | G4 | revalidar | `backend/src/modules/sendas/sendas.routes.test.ts`<br>`backend/src/modules/themes/themes.routes.test.ts` | `docs/evidencias/G4/README.md` |
| RF-09 | G4 | revalidar | `backend/src/modules/admin/publicacion/matriz-crecer.test.ts`<br>`frontend/src/features/crecer/componentes/actividad-wrapper.test.tsx` | `docs/evidencias/G4/README.md` |
| RF-10 | G4 | revalidar | `backend/src/modules/admin/publicacion/validar-publicacion.test.ts`<br>`backend/src/openapi/spec.test.ts` | `docs/evidencias/G4/README.md`<br>`docs/cms.md` |
| RF-11 | G4 | revalidar | `backend/src/modules/activities/activity-config.schemas.test.ts`<br>`frontend/src/shared/schemas/actividad-config.schema.test.ts` | `docs/evidencias/G4/README.md` |
| RF-12 | G4 | revalidar | `frontend/src/features/crecer/componentes/actividad-wrapper.test.tsx` | `docs/evidencias/G4/README.md` |
| RF-13 | G5 | revalidar | `backend/src/modules/gamification/gamification-awards.test.ts`<br>`backend/test/gamification-idempotency.e2e-spec.ts` | `docs/evidencias/G5/README.md` |
| RF-14 | G5 | cumple | `backend/src/modules/gamification/racha.service.test.ts` | `docs/evidencias/G5/README.md`<br>`backend/src/modules/gamification/racha.service.ts` |
| RF-15 | G5 | revalidar | `backend/src/modules/gamification/gamification-awards.test.ts` | `docs/evidencias/G5/README.md` |
| RF-16 | G4 | revalidar | `backend/src/modules/admin/admin.schemas.test.ts`<br>`backend/src/modules/admin/admin.routes.test.ts` | `docs/evidencias/G4/README.md`<br>`docs/cms.md` |
| RF-17 | G4 | cumple | `backend/src/modules/admin/publicacion/validar-publicacion.test.ts` | `docs/evidencias/G4/README.md` |
| RF-18 | G4 | revalidar | `backend/src/modules/admin/publicacion/validar-publicacion.test.ts`<br>`backend/src/modules/admin/admin.routes.test.ts` | `docs/evidencias/G4/README.md` |
| RF-19 | G4-G8 | revalidar | `backend/src/modules/themes/themes.service.test.ts` | `docs/evidencias/G4/README.md`<br>`docs/evidencias/G8/README.md` |
| RF-20 | G4 | revalidar | `backend/src/modules/media/media.routes.test.ts`<br>`backend/src/modules/media/media.use-cases.test.ts` | `docs/evidencias/G4/README.md`<br>`docs/seguridad.md` |
| RF-21 | G3 | revalidar | `frontend/src/lib/offline/download-transaction.test.ts`<br>`frontend/src/lib/offline/offline-package.test.ts` | `docs/evidencias/G3/README.md`<br>`docs/evidencias/G6/pwa.md` |
| RF-22 | G3 | brecha | `backend/src/modules/sync/sync.unit-of-work.test.ts`<br>`backend/src/modules/sync/casos-uso/procesar-sync-push.test.ts`<br>`frontend/src/lib/offline/sync-reconciliation.test.ts`<br>`frontend/src/lib/offline/syncEngine.test.ts` | `docs/evidencias/G3/README.md`<br>`docs/offline-sync.md` |
| RF-23 | G5 | revalidar | `backend/src/modules/clubs/casos-uso/clubs.test.ts`<br>`frontend/src/features/clubes/clubes.api.test.ts` | `docs/evidencias/G5/README.md` |
| RF-24 | G5 | revalidar | `backend/src/modules/clubs/clubs.mapper.test.ts` | `docs/evidencias/G5/README.md` |
| RF-25 | G5 | revalidar | `backend/src/modules/clubs/casos-uso/clubs.test.ts` | `docs/evidencias/G5/README.md` |
| RF-26 | G5 | cumple | `frontend/src/features/logros/utils/share-payload.test.ts` | `docs/evidencias/G5/README.md` |
| RF-27 | G4-G6 | revalidar | `tests/e2e/smoke.spec.ts`<br>`tests/e2e/accessibility.spec.ts` | `docs/evidencias/G6/pwa.md` |
| RF-B1 | G1 | revalidar | `backend/src/db/senda-imagen-schema.test.ts` | `supabase/migrations`<br>`docs/base-datos.md` |
| RF-B2 | G1 | cumple | `backend/src/openapi/spec.test.ts`<br>`backend/src/openapi/paridad-rutas.test.ts`<br>`tests/contrato-openapi-frontend.test.ts`<br>`tests/contrato-publico.test.ts` | `docs/api.md`<br>`backend/src/openapi/spec.ts`<br>`docs/evidencias/G1/README.md` |
| RNF-01 | G1 | revalidar | `backend/src/openapi/spec.test.ts`<br>`backend/src/legacy-routes.test.ts` | `docs/arquitectura.md`<br>`docs/api.md` |
| RNF-02 | G6 | brecha | `scripts/check-bundle-budget.test.ts`<br>`tests/e2e/pwa-offline.spec.ts` | `docs/evidencias/G6/baseline.md`<br>`docs/evidencias/G6/android-gama-baja.md` |
| RNF-03 | G6 | brecha | `frontend/src/lib/offline/sync-lifecycle.test.ts`<br>`backend/src/modules/sync/sync.unit-of-work.test.ts`<br>`frontend/src/lib/offline/sync-reconciliation.test.ts` | `docs/evidencias/G3/README.md` |
| RNF-04 | G4 | revalidar | `backend/src/modules/activities/activity-config.schemas.test.ts` | `docs/evidencias/G4/README.md`<br>`docs/cms.md` |
| RNF-05 | G1 | revalidar | `backend/src/db/senda-imagen-schema.test.ts` | `docs/base-datos.md`<br>`docs/evidencias/G1/README.md` |
| RNF-06 | G6 | cumple | `frontend/src/shared/i18n/i18n.test.ts` | `scripts/check-i18n.ts`<br>`docs/evidencias/G6/baseline.md` |
| RNF-07 | G6 | brecha | `tests/e2e/accessibility.spec.ts`<br>`frontend/src/features/crecer/hooks/use-narracion-paso.test.ts` | `docs/evidencias/G6/accessibility.md`<br>`docs/evidencias/G6/pwa.md` |
| RNF-08 | G4 | brecha | `scripts/check-doc-links.test.ts`<br>`tests/trazabilidad-requisitos.test.ts` | `docs/evidencias/G0/cobertura-baseline.md`<br>`docs/estado-docs.md` |
| RNF-09 | G6 | revalidar | `tests/e2e/pwa-installability.spec.ts`<br>`tests/e2e/pwa-offline.spec.ts` | `docs/evidencias/G6/pwa.md`<br>`docs/entrega/desviaciones.md` |
| RS-01 | G1 | revalidar | `backend/src/shared/middleware/auth.middleware.test.ts`<br>`backend/test/app.e2e-spec.ts` | `docs/evidencias/G1/README.md` |
| RS-02 | G1 | revalidar | `backend/src/shared/middleware/role.middleware.test.ts`<br>`backend/test/app.e2e-spec.ts` | `docs/evidencias/G1/README.md` |
| RS-03 | G2-G5 | revalidar | `backend/src/modules/users/users.schemas.test.ts`<br>`backend/src/modules/clubs/clubs.mapper.test.ts` | `docs/evidencias/G2/README.md`<br>`docs/evidencias/G5/README.md` |
| RS-04 | G6 | revalidar | `tests/e2e/smoke.spec.ts` | `docs/seguridad.md`<br>`docs/evidencias/G6/baseline.md` |
| RS-05 | G8 | revalidar | `scripts/smoke.test.ts` | `docs/evidencias/G8/README.md`<br>`frontend/public/_headers` |
| RS-06 | G3 | cumple | `backend/src/modules/admin/publicacion/validar-publicacion.test.ts`<br>`backend/src/shared/middleware/error-handler.test.ts` | `docs/seguridad.md`<br>`docs/evidencias/G1/README.md` |
| RS-07 | G3 | brecha | `frontend/src/lib/offline/user-scope.test.ts`<br>`backend/src/modules/sync/casos-uso/procesar-sync-push.test.ts` | `docs/evidencias/G3/README.md`<br>`docs/offline-sync.md` |
| RS-08 | G4 | revalidar | `backend/src/modules/admin/publicacion/validar-publicacion.test.ts`<br>`backend/src/modules/admin/admin.routes.test.ts` | `docs/evidencias/G4/README.md` |
| RS-09 | G5 | cumple | `backend/src/modules/clubs/moderation.routes.test.ts`<br>`backend/src/modules/clubs/moderation-policy.test.ts` | `docs/evidencias/G5/README.md` |
| RS-10 | G5 | brecha | `tests/seguridad-configuracion.test.ts` | `docs/seguridad.md`<br>`docs/evidencias/G1/README.md` |

## Criterio de aceptación

La matriz solo puede pasar a `cumple` después de que la evidencia corresponda al entorno exigido por el requisito, no únicamente a pruebas unitarias locales. La desviación `DESV-01` conserva una sola React PWA para web, Android, iOS y escritorio; no implica APK ni wrapper nativo.
