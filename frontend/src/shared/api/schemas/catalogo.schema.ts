import { z } from "zod";
import { SendaSchema } from "./temas.schema";

// --- GrupoEdad (catálogo) ---
export const GrupoEdadCatalogoSchema = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nombre: z.string(),
  edad_minima: z.number(),
  edad_maxima: z.number(),
  descripcion: z.string().nullable(),
  orden: z.number(),
  imagen_url: z.string().nullable().optional(),
});

export type GrupoEdadCatalogo = z.infer<typeof GrupoEdadCatalogoSchema>;

// --- Senda (re-exporta de temas) ---
export { SendaSchema };

// --- Versiones bíblicas ---
export const VersionBiblicaSchema = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  activo: z.boolean(),
  orden: z.number(),
});

export type VersionBiblica = z.infer<typeof VersionBiblicaSchema>;

// --- Tipos de actividad ---
export const TipoActividadCatalogoSchema = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  es_juego: z.boolean(),
  activo: z.boolean(),
  creado_en: z.string(),
});

export type TipoActividadCatalogo = z.infer<typeof TipoActividadCatalogoSchema>;
