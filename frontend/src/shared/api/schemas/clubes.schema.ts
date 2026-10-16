import { z } from "zod";

// --- Club ---
export const ClubSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  codigo_invitacion: z.string().optional(),
  creado_por: z.string().uuid(),
  activo: z.boolean(),
  creado_en: z.string(),
});

export const ClubPublicoSchema = ClubSchema.omit({ codigo_invitacion: true });

export const MiembroClubSchema = z.object({
  club_id: z.string().uuid(),
  usuario_id: z.string().uuid(),
  rol_miembro: z.string(),
  unido_en: z.string(),
  apodo: z.string(),
  clave_avatar: z.string().nullable(),
  url_avatar: z.string().nullable(),
  xp_total: z.number(),
  xp_semana: z.number(),
  actividades_semana: z.number(),
});

export const RankingClubSchema = MiembroClubSchema.extend({
  numero_ranking: z.number(),
});

export const RetoClubSchema = z.object({
  id: z.string().uuid(),
  club_id: z.string().uuid().nullable(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  codigo_metrica: z.string(),
  valor_objetivo: z.number(),
  xp_reto: z.number(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  creado_por: z.string().nullable(),
  creado_en: z.string(),
  progreso_actual: z.number(),
  mi_aporte: z.number(),
  porcentaje: z.number(),
  completado: z.boolean(),
  recompensa_reclamada: z.boolean(),
});

export type Club = z.infer<typeof ClubSchema>;
export type ClubPublico = z.infer<typeof ClubPublicoSchema>;
export type MiembroClub = z.infer<typeof MiembroClubSchema>;
export type RankingClub = z.infer<typeof RankingClubSchema>;
export type RetoClub = z.infer<typeof RetoClubSchema>;
