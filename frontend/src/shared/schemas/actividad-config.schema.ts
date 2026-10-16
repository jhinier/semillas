import { z } from "zod";

const texto = z.string().trim().min(1);
const opcion = z.object({ texto, correcta: z.boolean().optional() });

export const CODIGOS_ACTIVIDAD_CANONICOS = [
  "cuestionario", "tarjetas_memoria", "completar_versiculo", "relacionar_pares",
  "verdadero_falso", "sopa_letras", "arrastrar_soltar", "rompecabezas",
  "aventura_decisiones", "actividad_audio", "actividad_video", "manualidad", "cancion",
] as const;

const configuraciones = [
  z.object({ tipo: z.literal("cuestionario"), opciones: z.array(opcion).min(2).max(6) }),
  z.object({ tipo: z.literal("tarjetas_memoria"), pares: z.array(z.object({ id: texto, texto })).min(2) }),
  z.object({ tipo: z.literal("completar_versiculo"), frase: texto.refine((value) => value.includes("__")), respuesta: texto, opciones: z.array(texto).min(1) }),
  z.object({ tipo: z.literal("relacionar_pares"), pares: z.array(z.object({ izquierda: texto, derecha: texto })).min(2) }),
  z.object({ tipo: z.literal("verdadero_falso"), afirmaciones: z.array(z.object({ texto, es_verdadero: z.boolean() })).min(2) }),
  z.object({ tipo: z.literal("sopa_letras"), palabras: z.array(texto).min(2), filas: z.number().int().min(6).max(18), columnas: z.number().int().min(6).max(18) }),
  z.object({ tipo: z.literal("arrastrar_soltar"), items: z.array(texto).min(2), orden_correcto: z.array(z.number().int()).min(2) }),
  z.object({ tipo: z.literal("rompecabezas"), imagen: texto, filas: z.number().int().min(2).max(6), columnas: z.number().int().min(2).max(6) }),
  z.object({ tipo: z.literal("aventura_decisiones"), escenas: z.array(z.object({ texto, opciones: z.array(opcion).min(2) })).min(1) }),
  z.object({ tipo: z.literal("actividad_audio"), audio_url: z.string().url(), pregunta: texto, opciones: z.array(opcion).min(2) }),
  z.object({ tipo: z.literal("actividad_video"), video_url: z.string().url(), pregunta: texto, opciones: z.array(opcion).min(2), respuesta_correcta: z.number().int().nonnegative() }),
  z.object({ tipo: z.literal("manualidad"), materiales: z.array(texto).min(1), pasos: z.array(texto).min(1) }),
  z.object({ tipo: z.literal("cancion"), audio_url: z.string().url(), letra: z.array(texto).min(1), acciones: z.array(texto).optional() }),
] as const;

export const ActividadConfigSchema = z.discriminatedUnion("tipo", configuraciones);
export type ActividadConfig = z.infer<typeof ActividadConfigSchema>;
