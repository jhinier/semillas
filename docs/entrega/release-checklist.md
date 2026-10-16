# Release checklist

## Verificación técnica

- [ ] Matriz completa y evidencias revisadas: [matriz final](../trazabilidad/matriz-final.md).
- [ ] `bun install --frozen-lockfile` y `bun run check` pasan.
- [ ] `bun run docs:check`, `bun run performance:bundle` y `bun run pwa:check` pasan.
- [ ] Backup/restore y rollback ejecutados en staging: [runbook](../operacion/backup-restore.md).
- [ ] Smoke y E2E de staging pasan: [smoke checklist](../operacion/smoke-checklist.md).
- [ ] Android real valida instalación, cierre/reapertura y offline.
- [ ] Secretos fuera de Git y rotados.

## Aprobación

- [ ] G6 y G7 aprobados con evidencia reproducible.
- [ ] Desviación PWA sin APK firmada por Dirección/Product Owner.
- [ ] Acta firmada por líderes M1–M10, M9 y release manager.
- [ ] Tag creado después del smoke de producción.
