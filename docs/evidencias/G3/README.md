# Evidencia parcial del Gate G3

Implementado:

- `SyncRepository.ejecutarAtomico` ejecuta evento y proyecciones con
  `db.transaction`.
- `crearSyncUnitOfWork` delega transacciones y propaga fallos para rollback.
- Un evento duplicado se omite antes de aplicar proyecciones o recompensas.
- La misma clave de evento puede procesarse una vez por cada usuario, sin
  cruzar la idempotencia entre identidades.
- El cliente elimina eventos confirmados y omitidos, por lo que un ACK perdido
  puede reintentarse sin duplicar XP.
- La reconciliación pura del cliente trata `omitidos_ids` como confirmación del
  servidor y conserva errores específicos o IDs sin confirmación para revisión.
- El outbox y el cache social incorporan `scopeId`; los eventos pendientes solo
  se leen y cuentan para la sesión activa.
- El perfil local y el progreso reconciliado quedan asociados a
  `usuario:<uuid>` o `invitado:<uuid>`; el cursor de sincronización usa una
  clave distinta por identidad y no se infiere desde IndexedDB sin sesión.
- La importación de paquetes crea `localId` independientes mediante un mapa
  server-to-local y conserva los IDs al actualizar una descarga existente.
- La base local usa la versión 5 para separar `mediaCache` de sus referencias
  por tema; compartir un recurso entre dos temas ya no permite borrarlo al
  eliminar solo uno.
- El ciclo de sincronización incorpora `visibilitychange`, reconexión y
  backoff exponencial con jitter; la UI distingue pendiente, reintentando y
  requiere revisión.

Verificación local:

```bash
bun test backend/src/modules/sync/sync.unit-of-work.test.ts
bun test backend/src/modules/sync/casos-uso/procesar-sync-push.test.ts
bun test frontend/src/lib/offline/user-scope.test.ts
bun test frontend/src/lib/offline/sync-reconciliation.test.ts frontend/src/lib/offline/syncEngine.test.ts
bun test frontend/src/lib/offline/download-transaction.test.ts frontend/src/lib/offline/db-migrations.test.ts
```

Pendiente: prueba concurrente y rollback contra PostgreSQL/Supabase real,
validación completa de ownership por identidad, descarga multimedia
transaccional y E2E con cierre/reapertura del navegador.
