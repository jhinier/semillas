import { z } from "zod";

export const updateProfileSchema = z.object({
  apodo: z.string().min(2).max(40).optional(),
  grupo_edad_id: z.string().uuid().nullable().optional(),
  url_avatar: z.string().url().nullable().optional(),
  clave_avatar: z.string().min(1).max(255).nullable().optional(),
  prefiere_audio: z.boolean().optional(),
  tamano_texto_preferido: z.enum(["pequeno", "mediano", "grande"]).optional()
}).strict();
