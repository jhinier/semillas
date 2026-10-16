export { db } from "./db";
export type {
  TemaLocal,
  PasoLocal,
  ActividadLocal,
  ProgresoUsuarioLocal,
  EventoOutbox,
  SyncState,
  PerfilLocal,
  MediaCache,
  DescargaJobLocal,
} from "./db";

export {
  queueEventoProgreso,
  getEventosPendientes,
  getEventosFallidos,
  markEventoProcesado,
  getPendingCount,
  eliminarEventosFallidos,
  reintentarEventosFallidos,
} from "./outbox";

export {
  syncFull,
  pushPendingEvents,
  pullCambios,
  getSyncStatus,
  startAutoSync,
  stopAutoSync,
} from "./syncEngine";
export type { SyncStatus, SyncResult } from "./syncEngine";

export {
  useOnlineStatus,
  useSyncStatus,
  useEventosPendientes,
  useTemasLocales,
  useTemaLocal,
  usePasosLocales,
  useActividadesLocales,
  useProgresoLocal,
  useProgresosLocales,
  useRegistrarEventoProgreso,
  useSincronizarAhora,
  useAutoSync,
  useDescargaJobs,
  useOfflineStorage,
  useReintentarEventosFallidos,
  useEliminarEventosFallidos,
} from "./hooks";

export { useDescargarTema, eliminarTemaDescargado } from "./useDescargarTema";
export { claveCacheScope } from "./scoped-cache";
export {
  construirRutaMediaOffline,
  mapearPaqueteOfflineARegistros,
} from "./offline-package";
export {
  cachearMediosPaqueteOffline,
  eliminarMediosTemaOffline,
  obtenerMedioCacheado,
  obtenerUsoAlmacenamiento,
  solicitarAlmacenamientoPersistente,
  obtenerUrlMediaLocal,
  OFFLINE_MEDIA_CACHE,
} from "./media-cache";
export {
  descargarMediosTransaccional,
  crearRegistrosMedia,
  OFFLINE_MEDIA_STAGING_CACHE,
} from "./download-transaction";
