import { z } from "zod";

export const createGuestSchema = z.object({
  apodo: z.string().min(2).max(40).default("Invitado"),
  grupo_edad_id: z.string().uuid().optional(),
  url_avatar: z.string().url().optional()
});
