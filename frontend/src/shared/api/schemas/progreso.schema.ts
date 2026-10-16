import { z } from "zod";

export const ProgresoTemaSchema = z.object({
  usuario_id: z.string().uuid(),
  tema_id: z.string().uuid(),
  estado: z.string(),
  porcentaje: z.number(),
  iniciado_en: z.string().nullable(),
  completado_en: z.string().nullable(),
  ultimo_paso_id: z.string().nullable(),
  actualizado_en: z.string(),
});

export const ProgresoActividadSchema = z.object({
  usuario_id: z.string().uuid(),
  actividad_id: z.string().uuid(),
  intentos: z.number(),
  mejor_puntaje: z.number(),
  completado: z.boolean(),
  completado_en: z.string().nullable(),
  actualizado_en: z.string(),
});

export const MiProgresoSchema = z.object({
  temas: z.array(ProgresoTemaSchema),
  actividades: z.array(ProgresoActividadSchema),
  total_xp: z.number(),
  nivel_actual: z.number(),
});

export type ProgresoTema = z.infer<typeof ProgresoTemaSchema>;
export type ProgresoActividad = z.infer<typeof ProgresoActividadSchema>;
export type MiProgreso = z.infer<typeof MiProgresoSchema>;

// --- Evento de progreso (para POST /progreso/eventos) ---
export const EventoProgresoSchema = z.object({
  evento_id_cliente: z.string().uuid(),
  tipo_evento: z.enum([
    "tema_iniciado",
    "tema_completado",
    "bloque_iniciado",
    "bloque_completado",
    "actividad_iniciada",
    "actividad_respondida",
    "actividad_completada",
    "recompensa_reclamada",
    "tema_descargado",
    "marcador_sincronizacion",
  ]),
  tema_id: z.string().uuid().optional(),
  paso_id: z.string().uuid().optional(),
  actividad_id: z.string().uuid().optional(),
  correcta: z.boolean().optional(),
  puntaje: z.number().optional(),
  xp_otorgada: z.number().optional(),
  datos: z.record(z.string(), z.unknown()).optional(),
  ocurrido_en_cliente: z.string().optional(),
  dispositivo_id: z.string().optional(),
});

export type EventoProgreso = z.infer<typeof EventoProgresoSchema>;
