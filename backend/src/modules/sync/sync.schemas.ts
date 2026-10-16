import { z } from "zod";

const tipoEventoEnum = z.enum([
  "tema_iniciado",
  "tema_completado",
  "bloque_iniciado",
  "bloque_completado",
  "actividad_iniciada",
  "actividad_respondida",
  "actividad_completada",
  "recompensa_reclamada",
  "tema_descargado",
  "marcador_sincronizacion"
]);

export const syncPullQuerySchema = z.object({
  since: z.string().datetime().optional()
});

export const syncPushEventSchema = z.object({
  evento_id_cliente: z.string().uuid(),
  tipo_evento: tipoEventoEnum,
  tema_id: z.string().uuid().optional(),
  paso_id: z.string().uuid().optional(),
  actividad_id: z.string().uuid().optional(),
  correcta: z.boolean().optional(),
  puntaje: z.number().min(0).max(100).optional(),
  xp_otorgada: z.number().int().min(0).default(0),
  datos: z.record(z.string(), z.unknown()).default({}),
  creado_en_cliente: z.string().datetime().optional(),
  dispositivo_id: z.string().optional()
});

export const syncPushBodySchema = z.object({
  eventos: z.array(syncPushEventSchema).min(1).max(100)
});

export type SyncPullQuery = z.infer<typeof syncPullQuerySchema>;
export type SyncPushBody = z.infer<typeof syncPushBodySchema>;
export type SyncPushEvent = z.infer<typeof syncPushEventSchema>;
