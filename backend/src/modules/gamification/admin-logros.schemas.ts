import { z } from "zod";

/**
 * Criterios que el motor de logros soporta.
 * Mantener sincronizado con `MetricasLogros` en
 * `backend/src/modules/gamification/gamification-awards.ts`.
 */
export const criteriosLogro = [
  "temas_completados",
  "actividades_completadas",
  "dias_racha",
] as const;

export const codigoCriterioLogroSchema = z.enum(criteriosLogro);

export const logroParamsSchema = z.object({
  logroId: z.string().uuid(),
});

export const adminLogrosListSchema = z.object({
  q: z.string().trim().max(120).optional(),
  estado: z.enum(["activo", "archivado", "todos"]).default("todos"),
  criterio: codigoCriterioLogroSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const crearLogroAdminSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9_-]+$/u, "Usa solo minúsculas, números, guion o guion bajo."),
  nombre: z.string().trim().min(3).max(100),
  descripcion: z.string().trim().max(300).optional(),
  url_icono: z.string().trim().url().max(500).optional(),
  bono_xp: z.coerce.number().int().min(0).max(10_000).default(0),
  codigo_criterio: codigoCriterioLogroSchema,
  valor_criterio: z.coerce.number().int().min(1).max(10_000),
});

export const actualizarLogroAdminSchema = z
  .object({
    nombre: z.string().trim().min(3).max(100).optional(),
    descripcion: z.string().trim().max(300).nullable().optional(),
    url_icono: z.string().trim().url().max(500).nullable().optional(),
    bono_xp: z.coerce.number().int().min(0).max(10_000).optional(),
    codigo_criterio: codigoCriterioLogroSchema.optional(),
    valor_criterio: z.coerce.number().int().min(1).max(10_000).optional(),
  })
  .refine(
    (datos) =>
      datos.nombre !== undefined ||
      datos.descripcion !== undefined ||
      datos.url_icono !== undefined ||
      datos.bono_xp !== undefined ||
      datos.codigo_criterio !== undefined ||
      datos.valor_criterio !== undefined,
    { message: "Envía al menos un campo para actualizar" },
  );

export type CrearLogroAdminEntrada = z.infer<typeof crearLogroAdminSchema>;
export type ActualizarLogroAdminEntrada = z.infer<typeof actualizarLogroAdminSchema>;
export type AdminLogrosListEntrada = z.infer<typeof adminLogrosListSchema>;
export type CodigoCriterioLogro = z.infer<typeof codigoCriterioLogroSchema>;