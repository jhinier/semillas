import { z } from "zod";

export const updateProfileSchema = z.object({
  apodo: z.string().trim().min(2, "El apodo debe tener al menos 2 caracteres").max(40, "El apodo no puede superar 40 caracteres").optional(),
  grupo_edad_id: z.string().uuid().nullable().optional(),
  url_avatar: z.string().url().max(500).nullable().optional(),
  clave_avatar: z.string().min(1).max(255).nullable().optional(),
  prefiere_audio: z.boolean().optional(),
  tamano_texto_preferido: z.enum(["pequeno", "mediano", "grande"]).optional()
}).strict();
