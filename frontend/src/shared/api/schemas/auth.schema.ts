import { z } from "zod";

export const UsuarioSchema = z.object({
  id: z.string().uuid(),
  rol: z.string(),
  proveedor: z.string(),
  nombre_visible: z.string(),
  correo: z.string().nullable(),
});

export type Usuario = z.infer<typeof UsuarioSchema>;
