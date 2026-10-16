import { z } from "zod";

export const LogroSchema = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  codigo_criterio: z.string(),
  valor_criterio: z.number().nullable(),
  bono_xp: z.number(),
  url_icono: z.string().nullable(),
  activo: z.boolean(),
  creado_en: z.string(),
});

export const LogroUsuarioSchema = z.object({
  usuario_id: z.string().uuid(),
  logro_id: z.string().uuid(),
  ganado_en: z.string(),
  reclamado_en: z.string().nullable(),
  logro: LogroSchema.optional(),
});

export const NivelSchema = z.object({
  usuario_id: z.string().uuid(),
  xp_total: z.number(),
  numero_nivel: z.number(),
  nombre_nivel: z.string(),
});

export const MiGamificacionSchema = z.object({
  nivel: NivelSchema.nullable(),
  logros: z.array(LogroUsuarioSchema),
  pendientes_reclamar: z.number(),
});

export type Logro = z.infer<typeof LogroSchema>;
export type LogroUsuario = z.infer<typeof LogroUsuarioSchema>;
export type Nivel = z.infer<typeof NivelSchema>;
export type MiGamificacion = z.infer<typeof MiGamificacionSchema>;
