import { z } from "zod";

// --- Evento sincronizado ---
export const EventoSincronizacionSchema = z.object({
  id: z.string().uuid(),
  usuario_id: z.string().uuid(),
  id_evento_cliente: z.string().uuid(),
  tipo_evento: z.string(),
  tema_id: z.string().nullable(),
  paso_id: z.string().nullable(),
  actividad_id: z.string().nullable(),
  correcta: z.boolean().nullable(),
  puntaje: z.number().nullable(),
  xp_otorgada: z.number(),
  datos: z.unknown(),
  ocurrido_en_cliente: z.string(),
  dispositivo_id: z.string().nullable(),
  recibido_en_servidor: z.string(),
});

// --- Progreso tema (sync) ---
export const ProgresoTemaSyncSchema = z.object({
  usuario_id: z.string().uuid(),
  tema_id: z.string().uuid(),
  estado: z.string(),
  porcentaje: z.number(),
  iniciado_en: z.string().nullable(),
  completado_en: z.string().nullable(),
  ultimo_paso_id: z.string().nullable(),
  actualizado_en: z.string(),
});

// --- Progreso actividad (sync) ---
export const ProgresoActividadSyncSchema = z.object({
  usuario_id: z.string().uuid(),
  actividad_id: z.string().uuid(),
  intentos: z.number(),
  mejor_puntaje: z.number(),
  completado: z.boolean(),
  completado_en: z.string().nullable(),
  actualizado_en: z.string(),
});

// --- GET /sync/pull response ---
export const SyncPullResponseSchema = z.object({
  eventos: z.array(EventoSincronizacionSchema),
  progreso: z.object({
    temas: z.array(ProgresoTemaSyncSchema),
    actividades: z.array(ProgresoActividadSyncSchema),
  }),
  timestamp_servidor: z.string(),
});

export type EventoSincronizacion = z.infer<typeof EventoSincronizacionSchema>;
export type ProgresoTemaSync = z.infer<typeof ProgresoTemaSyncSchema>;
export type ProgresoActividadSync = z.infer<typeof ProgresoActividadSyncSchema>;
export type SyncPullResponse = z.infer<typeof SyncPullResponseSchema>;

// --- POST /sync/push response ---
export const SyncPushResponseSchema = z.object({
  procesados: z.number(),
  omitidos: z.number(),
  errores: z.array(z.object({
    evento_id: z.string(),
    error: z.string(),
  })),
  logros_desbloqueados: z.array(z.object({
    logro_id: z.string(),
    nombre: z.string(),
  })),
  timestamp_servidor: z.string(),
});

export type SyncPushResponse = z.infer<typeof SyncPushResponseSchema>;

// --- POST /sync/push request ---
export const SyncPushRequestSchema = z.object({
  eventos: z.array(z.object({
    evento_id_cliente: z.string(),
    tipo_evento: z.string(),
    tema_id: z.string().nullable().optional(),
    paso_id: z.string().nullable().optional(),
    actividad_id: z.string().nullable().optional(),
    correcta: z.boolean().nullable().optional(),
    puntaje: z.number().nullable().optional(),
    xp_otorgada: z.number().nullable().optional(),
    datos: z.unknown().optional(),
    ocurrido_en_cliente: z.string(),
    dispositivo_id: z.string().nullable().optional(),
  })),
  timestamp_cliente: z.string(),
});

export type SyncPushRequest = z.infer<typeof SyncPushRequestSchema>;
