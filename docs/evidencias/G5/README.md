# G5 — Evidencia parcial de gamificación y social

## Completado en código

- `share-payload.test.ts` verifica que una tarjeta compartida solo contiene insignia, XP y marca genérica.
- Los enlaces sociales ya no incluyen la URL privada de la pantalla actual.
- El cierre de sesión limpia queries y caches runtime de usuario; el contenido/progreso/outbox Dexie permanece aislado por `usuario:<uuid>` o `invitado:<uuid>` para no perder trabajo pendiente.
- Los reclamos de retos conservan `ON CONFLICT DO NOTHING` para evitar recompensas duplicadas.
- El reclamo de insignias usa un `UPDATE ... WHERE reclamado_en IS NULL RETURNING`; solo la transacción que obtiene la fila otorga XP.
- El flujo online heredado de `/progreso/eventos` también calcula `dias_racha` con los días de actividad autoritativos del servidor; no deja ese criterio sin evaluar.
- La racha usa `America/Guayaquil` como zona de referencia en el cálculo de días y tiene pruebas de cambio de fecha en UTC/local.
- Los reportes de clubes tienen categorías cerradas, límite de cinco por hora,
  autorización de administrador para resolver y auditoría transaccional en
  `reporte_club`.
- La PWA expone diálogo de reporte para miembros y panel administrativo para
  revisar, resolver o descartar reportes.
- `tests/e2e/gamificacion-social.spec.ts` cubre en la PWA el reclamo de un reto,
  el envío de un reporte y la ausencia de correo/nombre real en la interfaz;
  usa respuestas sintéticas y no sustituye el E2E contra staging.

## Pendiente de aceptación

El gate G5 no está aprobado todavía: falta ejecutar un E2E social completo
contra staging con identidad controlada. Las pruebas unitarias de recompensas,
rachas, privacidad, moderación, cache y compartir ya están en la suite local.
