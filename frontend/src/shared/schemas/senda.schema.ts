import { z } from 'zod';

export const SendaSchema = z.object({
  codigo: z.string().min(1, 'Código requerido'),
  nombre: z.string().min(1, 'Nombre requerido'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser hex'),
  orden: z.number().min(1, 'Orden debe ser mayor a 0'),
  descripcion: z.string().optional(),
});

export type SendaFormData = z.infer<typeof SendaSchema>;
