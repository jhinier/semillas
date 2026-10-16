# Offline y sincronización

**Owner:** M8 · **Revisión:** 2026-07-13

La PWA lee y escribe primero en Dexie (`frontend/src/lib/offline/db.ts`). Un
paquete descargado contiene tema, pasos, actividades y referencias multimedia.

1. La acción local se guarda en `eventosOutbox` con UUID local.
2. `syncEngine` envía el lote a `POST /sync/push` al reconectar.
3. El servidor valida el evento y responde IDs procesados u omitidos.
4. El cliente elimina solo eventos confirmados y ejecuta `GET /sync/pull`.

Un reintento con el mismo UUID es seguro. Los estados visibles son sincronizado,
pendiente, reintentando, falló y requiere revisión. Nunca se reasigna un outbox
de una identidad a otra. Los registros privados usan `scopeId` (`usuario:<uuid>`
o `invitado:<uuid>`), el cursor de sincronización también es por scope y los
paquetes públicos usan IDs locales independientes de sus IDs del servidor.
El flujo de logout limpia el runtime y caches privados, pero conserva los datos
Dexie aislados por scope para no perder progreso pendiente; queda pendiente
exponer en la UI la decisión explícita entre sincronizar, cancelar o conservar el
outbox aislado antes de cerrar sesión.
