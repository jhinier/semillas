import { z } from "zod";

export const categoriasReporteClub = ["contenido_inapropiado", "acoso", "datos_personales", "otro"] as const;
export const estadosReporteClub = ["abierto", "en_revision", "resuelto", "descartado"] as const;

export const crearReporteClubSchema = z.object({
  miembro_token: z.string().uuid(),
  categoria: z.enum(categoriasReporteClub),
  detalle: z.string().trim().max(500).optional(),
});

export const resolverReporteClubSchema = z.object({
  estado: z.enum(estadosReporteClub),
  nota: z.string().trim().max(500).optional(),
});

export type CrearReporteClubInput = z.infer<typeof crearReporteClubSchema>;
export type ResolverReporteClubInput = z.infer<typeof resolverReporteClubSchema>;
export type EstadoReporteClub = (typeof estadosReporteClub)[number];
