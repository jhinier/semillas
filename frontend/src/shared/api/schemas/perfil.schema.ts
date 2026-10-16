import { z } from "zod";

export const PerfilSchema = z.object({
  id: z.string().uuid(),
  usuario_id: z.string().uuid(),
  apodo: z.string(),
  grupo_edad_id: z.string().nullable(),
  url_avatar: z.string().nullable(),
  clave_avatar: z.string().nullable(),
  prefiere_audio: z.boolean(),
  tamano_texto_preferido: z.string(),
  creado_en: z.string().optional(),
  actualizado_en: z.string().optional(),
});

export type Perfil = z.infer<typeof PerfilSchema>;
