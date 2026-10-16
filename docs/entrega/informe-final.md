# Informe final

Estado: **pre-cierre técnico; aceptación formal pendiente**.

## Alcance

Semillas se entrega como una única React PWA responsive para web, Android, iOS
y escritorio. La infraestructura usa Supabase remoto; no se requiere
Supabase local ni Docker. No se construye APK ni wrapper nativo separado.

## Evidencia local disponible

- [Matriz final](../trazabilidad/matriz-final.md) y [desviaciones](desviaciones.md).
- [Arquitectura](../arquitectura.md), [API](../backend-api.md) y
  [sincronización offline](../offline-sync.md).
- [Evidencias G0–G8](../evidencias/G0/README.md), incluyendo el
  [workflow de release](../evidencias/G8/workflow.md).
- El workflow de producción promueve el artifact PWA generado en staging y
  valida su manifest, service worker y budgets antes de publicarlo.
- [Backup y restore](../operacion/backup-restore.md),
  [rollback](../operacion/rollback.md) y [smoke](../operacion/smoke-checklist.md).

## Estado de aceptación

La implementación local tiene pruebas de contrato, seguridad, documentación,
presupuesto de bundle, PWA, accesibilidad y sync idempotente. La aceptación no
se declara todavía: faltan ejecutar en entornos protegidos staging/producción
el backup/restore, rollback, smoke y E2E; además faltan la validación en
Android físico, el umbral final de Lighthouse, cobertura global de 80 % y la
firma de Dirección para `DESV-01`.

El release manager debe completar el [release checklist](release-checklist.md),
adjuntar SHA, URLs sanitizadas, resultados y responsables antes de cambiar el
estado a aceptado.
