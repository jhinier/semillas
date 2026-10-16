import { z } from "zod";

export const tipoRecursoEnum = z.enum(["imagen", "audio", "video", "documento"]);

const metadataTecnicaSchema = z.object({
  anchoPx: z.number().int().positive().nullable().optional(),
  altoPx: z.number().int().positive().nullable().optional(),
  duracionSeg: z.number().int().nonnegative().nullable().optional(),
});

export const crearRecursoSchema = z
  .object({
    tipo: tipoRecursoEnum,
    textoAlternativo: z.string().trim().max(300).optional(),
    titulo: z.string().trim().min(2).max(120).optional(),
  })
  .merge(metadataTecnicaSchema);

export const actualizarRecursoSchema = z
  .object({
    titulo: z.string().trim().min(2).max(120).optional(),
    textoAlternativo: z.string().trim().max(300).nullable().optional(),
  })
  .refine(
    (data) => data.titulo !== undefined || data.textoAlternativo !== undefined,
    "Debes enviar al menos un campo para actualizar",
  );

export const reemplazarRecursoSchema = z
  .object({
    titulo: z.string().trim().min(2).max(120).optional(),
    textoAlternativo: z.string().trim().max(300).nullable().optional(),
  })
  .merge(metadataTecnicaSchema);
