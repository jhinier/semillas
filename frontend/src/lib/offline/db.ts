import Dexie, { type EntityTable } from "dexie";

export type SyncRecordStatus = "synced" | "pending" | "error";

export interface TemaLocal {
  localId: string;
  serverId?: string;
  paqueteId?: string | null;
  paqueteVersionContenido?: number | null;
  titulo: string;
  slug: string;
  objetivo: string;
  resumen: string | null;
  portadaUrl: string | null;
  portadaMediaId?: string | null;
  sendaId?: string | null;
  sendaCodigo?: string | null;
  sendaNombre?: string | null;
  sendaColorHex?: string | null;
  estado: string;
  xpRecompensa: number;
  minutosEstimados: number;
  versionContenido: number;
  publicadoEn: string | null;
  grupoEdadId: string | null;
  paqueteTamanoBytes?: number | null;
  descargaEstado?: "disponible" | "descargando" | "descargado" | "actualizacion" | "error";
  descargaProgreso?: number;
  descargadoEn?: string | null;
  errorDescarga?: string | null;
  packageId?: string | null;
  packageSizeBytes?: number | null;
  mediaServerIds?: string[];
  downloadedAt?: string;
  lastOpenedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  syncStatus: "synced" | "pending" | "error";
}

export interface PasoLocal {
  localId: string;
  serverId?: string;
  temaLocalId: string;
  orden: number;
  obligatorio: boolean;
  tipoPasoId: string | null;
  tipoPasoCodigo: string | null;
  tipoPasoNombre: string | null;
  tipoPasoColorHex: string | null;
  contenidos: Array<{
    id: string;
    grupoEdadId: string;
    titulo: string;
    cuerpo: string;
    instruccionCorta: string | null;
    recursoId: string | null;
    recursoAudioId: string | null;
    datosExtra: Record<string, unknown> | null;
  }>;
  preguntas: Array<{
    id: string;
    grupoEdadId: string;
    pregunta: string;
    orden: number;
  }>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  syncStatus: SyncRecordStatus;
}

export interface ActividadLocal {
  localId: string;
  serverId?: string;
  temaLocalId: string;
  pasoLocalId: string | null;
  grupoEdadId: string;
  tipoActividadId: string;
  tipoActividadCodigo: string;
  tipoActividadNombre: string;
  tipoActividadDescripcion: string | null;
  tipoActividadEsJuego: boolean;
  titulo: string;
  consigna: string;
  orden: number;
  xpRecompensa: number;
  dificultad: string;
  limiteTiempoSeg: number | null;
  obligatorio: boolean;
  retroalimentacion: string | null;
  configuracion: Record<string, unknown>;
  opciones: Array<{
    id: string;
    etiqueta: string | null;
    texto: string;
    correcta: boolean;
    orden: number;
    retroalimentacion: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  syncStatus: SyncRecordStatus;
}

export interface ProgresoUsuarioLocal {
  localId: string;
  serverId?: string;
  temaLocalId: string;
  pasoLocalId: string | null;
  actividadLocalId: string | null;
  estado: "en_progreso" | "completado";
  porcentaje: number;
  iniciadoEn: string | null;
  completadoEn: string | null;
  mejorPuntaje: number | null;
  intentos: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  syncStatus: SyncRecordStatus;
  scopeId?: string;
}

export interface EventoOutbox {
  id?: number;
  localId: string;
  tipoEvento:
    | "tema_iniciado"
    | "tema_completado"
    | "bloque_iniciado"
    | "bloque_completado"
    | "actividad_iniciada"
    | "actividad_respondida"
    | "actividad_completada"
    | "recompensa_reclamada"
    | "tema_descargado"
    | "marcador_sincronizacion";
  temaLocalId?: string;
  pasoLocalId?: string;
  actividadLocalId?: string;
  correcta?: boolean;
  puntaje?: number;
  xpOtorgada?: number;
  datos?: Record<string, unknown>;
  ocurridoEnCliente: string;
  dispositivoId: string;
  retries: number;
  lastError?: string;
  createdAt: number;
  scopeId?: string;
}

export interface SyncState {
  id: string;
  lastSyncTimestamp: string | null;
  lastSyncExito: boolean;
  pendingCount: number;
  updatedAt: string;
  scopeId?: string;
}

export interface PerfilLocal {
  localId: string;
  serverId?: string;
  usuarioId: string;
  usuarioRol: string;
  usuarioProveedor: string;
  usuarioNombreVisible: string;
  usuarioCorreo: string | null;
  apodo: string;
  grupoEdadId: string | null;
  urlAvatar: string | null;
  claveAvatar: string | null;
  prefiereAudio: boolean;
  tamanoTextoPreferido: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: "synced" | "pending" | "error";
  scopeId?: string;
}

export interface ClubCacheEntry {
  key: string;
  data: unknown;
  timestamp: number;
}

export interface MediaCache {
  id?: number;
  serverId: string;
  temaLocalId?: string;
  tipo: "imagen" | "audio" | "video" | "archivo";
  urlOriginal: string;
  urlLocal: string;
  textoAlternativo: string | null;
  tipoMime?: string | null;
  tamanoBytes: number | null;
  duracionSeg: number | null;
  anchoPx: number | null;
  altoPx: number | null;
  cachedAt: number;
  accessedAt: number;
}

export interface MediaCacheReference {
  id?: number;
  serverId: string;
  temaLocalId: string;
  createdAt: number;
}

export interface DescargaJobLocal {
  temaServerId: string;
  estado: "preparando" | "descargando" | "guardando" | "completada" | "error";
  progreso: number;
  error: string | null;
  updatedAt: string;
}

class SemillasDatabase extends Dexie {
  temas!: EntityTable<TemaLocal, "localId">;
  pasos!: EntityTable<PasoLocal, "localId">;
  actividades!: EntityTable<ActividadLocal, "localId">;
  progresoUsuario!: EntityTable<ProgresoUsuarioLocal, "localId">;
  eventosOutbox!: EntityTable<EventoOutbox, "id">;
  syncState!: EntityTable<SyncState, "id">;
  perfil!: EntityTable<PerfilLocal, "localId">;
  clubsCache!: EntityTable<ClubCacheEntry, "key">;
  mediaCache!: EntityTable<MediaCache, "id">;
  mediaReferences!: EntityTable<MediaCacheReference, "id">;
  descargaJobs!: EntityTable<DescargaJobLocal, "temaServerId">;

  constructor() {
    super("semillas_offline_db");

    this.version(1).stores({
      temas: "localId, serverId, slug, estado, syncStatus, updatedAt",
      pasos: "localId, serverId, temaLocalId, orden, syncStatus",
      actividades: "localId, serverId, temaLocalId, pasoLocalId, grupoEdadId, tipoActividadCodigo, syncStatus",
      progresoUsuario: "localId, serverId, temaLocalId, pasoLocalId, actividadLocalId, syncStatus, updatedAt",
      eventosOutbox: "++id, localId, tipoEvento, createdAt, retries",
      syncState: "id",
      perfil: "localId, serverId, syncStatus",
      mediaCache: "++id, serverId, temaLocalId, tipo, urlOriginal, cachedAt, accessedAt",
    });

    this.version(2).stores({
      temas: "localId, &serverId, slug, estado, grupoEdadId, syncStatus, downloadedAt, updatedAt",
      pasos: "localId, &serverId, temaLocalId, orden, syncStatus",
      actividades: "localId, &serverId, temaLocalId, pasoLocalId, grupoEdadId, tipoActividadCodigo, syncStatus",
      progresoUsuario: "localId, serverId, temaLocalId, pasoLocalId, actividadLocalId, syncStatus, updatedAt",
      eventosOutbox: "++id, &localId, tipoEvento, scopeId, createdAt, retries",
      syncState: "id",
      perfil: "localId, serverId, syncStatus",
      mediaCache: "++id, &serverId, tipo, urlOriginal, cachedAt, accessedAt",
      descargaJobs: "temaServerId, estado, updatedAt",
    });

    this.version(3).stores({
      clubsCache: "key",
      mediaCache: "++id, &serverId, temaLocalId, tipo, urlOriginal, cachedAt, accessedAt",
    });

    this.version(4).stores({
      progresoUsuario: "localId, serverId, temaLocalId, pasoLocalId, actividadLocalId, scopeId, syncStatus, updatedAt",
      syncState: "id, scopeId, updatedAt",
      perfil: "localId, serverId, usuarioId, scopeId, syncStatus",
    });

    this.version(5).stores({
      mediaReferences: "++id, &[serverId+temaLocalId], serverId, temaLocalId, createdAt",
    });
  }
}

export const db = new SemillasDatabase();
