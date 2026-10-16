import { z } from "zod";

// --- Sendas ---
export const SendaSchema = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  color_hex: z.string(),
  nombre_icono: z.string().nullable(),
  orden: z.number(),
});

export type Senda = z.infer<typeof SendaSchema>;

// --- GrupoEdad ---
export const GrupoEdadSchema = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nombre: z.string(),
  edad_minima: z.number(),
  edad_maxima: z.number(),
  descripcion: z.string().nullable(),
  orden: z.number(),
  imagen_url: z.string().nullable().optional(),
});

export type GrupoEdad = z.infer<typeof GrupoEdadSchema>;

// --- RecursoMultimedia (portada) ---
export const RecursoMultimediaSchema = z.object({
  id: z.string().uuid(),
  tipo: z.string().optional(),
  url_publica: z.string(),
  texto_alternativo: z.string().nullable(),
  titulo: z.string().nullable(),
  tipo_mime: z.string().nullable().optional(),
  tamano_bytes: z.number().nullable().optional(),
  duracion_seg: z.number().nullable().optional(),
  ancho_px: z.number().nullable().optional(),
  alto_px: z.number().nullable().optional(),
});

export type RecursoMultimedia = z.infer<typeof RecursoMultimediaSchema>;

// --- ReferenciaBiblica ---
export const ReferenciaBiblicaSchema = z.object({
  id: z.string().uuid(),
  tema_id: z.string().uuid(),
  libro_id: z.number(),
  capitulo: z.number(),
  versiculo_inicio: z.number(),
  versiculo_fin: z.number(),
  principal: z.boolean(),
});

export type ReferenciaBiblica = z.infer<typeof ReferenciaBiblicaSchema>;

// --- VersiculoClave ---
export const VersiculoClaveSchema = z.object({
  id: z.string().uuid(),
  tema_id: z.string().uuid(),
  texto: z.string(),
  libro_id: z.number(),
  capitulo: z.number(),
  versiculo: z.number(),
});

export type VersiculoClave = z.infer<typeof VersiculoClaveSchema>;

// --- Tema (lista) ---
export const TemaSchema = z.object({
  id: z.string().uuid(),
  senda_id: z.string().uuid(),
  titulo: z.string(),
  slug: z.string(),
  objetivo: z.string(),
  resumen: z.string().nullable(),
  portada_recurso_id: z.string().nullable(),
  portada_recurso: RecursoMultimediaSchema.nullable().optional(),
  estado: z.string(),
  version_biblica_id: z.string().nullable(),
  xp_recompensa: z.number(),
  minutos_estimados: z.number(),
  version_contenido: z.number(),
  publicado_en: z.string().nullable(),
  creado_en: z.string().nullable().optional(),
  actualizado_en: z.string().nullable().optional(),
  senda: SendaSchema.nullable().optional(),
  creado_por: z.object({ id: z.string(), nombre_visible: z.string() }).nullable().optional(),
  grupos_edad: z.array(z.object({ id: z.string(), codigo: z.string(), nombre: z.string() })).optional(),
});

export type Tema = z.infer<typeof TemaSchema>;

// --- TemaDetalle (con relaciones) ---
export const TemaDetalleSchema = TemaSchema.extend({
  senda: SendaSchema.nullable().optional(),
  creado_por: z.object({ id: z.string(), nombre_visible: z.string() }).nullable().optional(),
  grupos_edad: z.array(z.object({ id: z.string(), codigo: z.string(), nombre: z.string() })).optional(),
  versiculo_clave: VersiculoClaveSchema.nullable().optional(),
  referencia_biblica: ReferenciaBiblicaSchema.nullable().optional(),
});

export type TemaDetalle = z.infer<typeof TemaDetalleSchema>;

// --- Paso contenido ---
export const PasoContenidoSchema = z.object({
  id: z.string().uuid(),
  grupo_edad_id: z.string().uuid(),
  titulo: z.string(),
  cuerpo: z.string(),
  instruccion_corta: z.string().nullable(),
  recurso_id: z.string().nullable().optional(),
  recurso_audio_id: z.string().nullable().optional(),
  datos_extra: z.record(z.string(), z.unknown()).nullable().optional(),
});

// --- Paso pregunta ---
export const PasoPreguntaSchema = z.object({
  id: z.string().uuid(),
  grupo_edad_id: z.string().uuid(),
  pregunta: z.string(),
  orden: z.number(),
});

// --- Paso ---
export const PasoSchema = z.object({
  id: z.string().uuid(),
  tema_id: z.string().uuid(),
  orden: z.number(),
  tipo_paso: z.object({
    id: z.string().uuid(),
    codigo: z.string(),
    nombre: z.string(),
    orden: z.number(),
    color_hex: z.string().nullable(),
  }).nullable(),
  contenidos: z.array(PasoContenidoSchema),
  preguntas: z.array(PasoPreguntaSchema).optional(),
});

export type Paso = z.infer<typeof PasoSchema>;

// --- TipoActividad ---
export const TipoActividadSchema = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable().optional(),
  es_juego: z.boolean().optional(),
  activo: z.boolean().optional(),
  creado_en: z.string().optional(),
});

// --- OpcionActividad ---
export const OpcionActividadSchema = z.object({
  id: z.string().uuid(),
  actividad_id: z.string().uuid(),
  etiqueta: z.string().nullable(),
  texto: z.string(),
  orden: z.number(),
  correcta: z.boolean().optional(),
  retroalimentacion: z.string().nullable().optional(),
});

// --- Actividad (con tipos y opciones) ---
export const ActividadSchema = z.object({
  id: z.string().uuid(),
  tema_id: z.string().uuid(),
  paso_id: z.string().nullable(),
  grupo_edad_id: z.string().uuid(),
  tipo_actividad_id: z.string().uuid(),
  titulo: z.string(),
  consigna: z.string(),
  orden: z.number(),
  xp_recompensa: z.number(),
  dificultad: z.string(),
  limite_tiempo_seg: z.number().nullable(),
  obligatorio: z.boolean(),
  retroalimentacion: z.string().nullable(),
  configuracion: z.record(z.string(), z.unknown()),
  creado_en: z.string().optional(),
  actualizado_en: z.string().optional(),
  tipo_actividad: TipoActividadSchema.nullable().optional(),
  opciones: z.array(OpcionActividadSchema),
});

export type Actividad = z.infer<typeof ActividadSchema>;

// --- TemaPaqueteOffline (para descarga) ---
export const TemaPaqueteOfflineSchema = z.object({
  tema: TemaDetalleSchema,
  pasos: z.array(PasoSchema),
  actividades: z.array(ActividadSchema),
});

export type TemaPaqueteOffline = z.infer<typeof TemaPaqueteOfflineSchema>;
