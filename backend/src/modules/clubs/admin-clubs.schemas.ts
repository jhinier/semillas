import { z } from "zod";

export const clubParamsSchema = z.object({
  clubId: z.string().uuid(),
});

export const miembroClubParamsSchema = clubParamsSchema.extend({
  usuarioId: z.string().uuid(),
});

export const retoClubParamsSchema = clubParamsSchema.extend({
  retoId: z.string().uuid(),
});

export const adminClubListSchema = z.object({
  q: z.string().trim().max(120).optional(),
  estado: z.enum(["activo", "archivado", "todos"]).default("todos"),
  orden: z.enum(["recientes", "nombre", "miembros"]).default("recientes"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const crearClubAdminSchema = z.object({
  nombre: z.string().trim().min(3).max(80),
  descripcion: z.string().trim().max(300).optional(),
  lider_usuario_id: z.string().uuid(),
});

export const actualizarClubAdminSchema = z
  .object({
    nombre: z.string().trim().min(3).max(80).optional(),
    descripcion: z.string().trim().max(300).nullable().optional(),
  })
  .refine((datos) => datos.nombre !== undefined || datos.descripcion !== undefined, {
    message: "Envía al menos un campo para actualizar",
  });

export const agregarMiembroAdminSchema = z.object({
  usuario_id: z.string().uuid(),
});

export const cerrarRetoAdminSchema = z.object({
  motivo: z.string().trim().min(3).max(500),
});
