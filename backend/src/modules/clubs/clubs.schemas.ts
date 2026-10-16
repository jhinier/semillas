import { z } from "zod";

export const createClubSchema = z.object({
  nombre: z.string().trim().min(3).max(80),
  descripcion: z.string().trim().max(300).optional()
});

export const updateClubSchema = createClubSchema.partial().refine(
  (datos) => datos.nombre !== undefined || datos.descripcion !== undefined,
  { message: "Debes enviar al menos un campo para actualizar" }
);

export const joinClubSchema = z.object({
  codigo_acceso: z.string().trim().min(4).max(20).transform((codigo) => codigo.toUpperCase())
});

export const transferLeadershipSchema = z.object({
  usuario_id: z.string().uuid()
});

export const transferLeadershipPublicSchema = z.object({
  miembro_token: z.string().uuid()
});

export const createChallengeSchema = z.object({
  nombre: z.string().trim().min(3).max(120),
  descripcion: z.string().trim().max(300).optional(),
  codigo_metrica: z.enum(["xp_grupal", "actividades_completadas", "temas_completados"]),
  valor_objetivo: z.number().int().min(1).max(1_000_000),
  xp_reto: z.number().int().min(0).max(10_000).default(100),
  fecha_inicio: z.string().datetime(),
  fecha_fin: z.string().datetime()
}).superRefine((datos, contexto) => {
  if (new Date(datos.fecha_fin) <= new Date(datos.fecha_inicio)) {
    contexto.addIssue({
      code: "custom",
      path: ["fecha_fin"],
      message: "La fecha de fin debe ser posterior a la fecha de inicio"
    });
  }
});
