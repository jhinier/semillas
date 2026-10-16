import { z } from "zod";

export const progressEventSchema = z.object({
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
    "marcador_sincronizacion"
  ]),
  tema_id: z.string().uuid().optional(),
  paso_id: z.string().uuid().optional(),
  actividad_id: z.string().uuid().optional(),
  correcta: z.boolean().optional(),
  puntaje: z.number().min(0).max(100).optional(),
  xp_otorgada: z.number().int().min(0).default(0),
  datos: z.record(z.string(), z.unknown()).default({}),
  ocurrido_en_cliente: z.string().datetime().optional(),
  dispositivo_id: z.string().optional()
});
