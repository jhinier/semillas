import { z } from "zod";
import { TemaSchema, TemaDetalleSchema, PasoSchema, ActividadSchema } from "./temas.schema";

// --- Admin Tema (con creado_por y senda) ---
export const AdminTemaSchema = TemaSchema.extend({
  creado_por: z.object({ id: z.string(), nombre_visible: z.string() }).nullable(),
  senda: z.object({
    id: z.string(),
    codigo: z.string(),
    nombre: z.string(),
    color_hex: z.string(),
  }).nullable(),
});

export const AdminTemaDetalleSchema = AdminTemaSchema.extend({
  grupos_edad: z.array(z.object({ id: z.string(), codigo: z.string(), nombre: z.string() })),
  versiculo_clave: z.object({
    id: z.string(),
    tema_id: z.string(),
    texto: z.string(),
    libro_id: z.number(),
    capitulo: z.number(),
    versiculo: z.number(),
  }).nullable(),
  referencia_biblica: z.object({
    id: z.string(),
    tema_id: z.string(),
    libro_id: z.number(),
    capitulo: z.number(),
    versiculo_inicio: z.number(),
    versiculo_fin: z.number(),
    principal: z.boolean(),
  }).nullable(),
  portada_recurso: z.object({
    id: z.string(),
    url_publica: z.string(),
    texto_alternativo: z.string().nullable(),
    titulo: z.string().nullable(),
  }).nullable(),
});

export const AdminPasoSchema = PasoSchema;
export const AdminActividadSchema = ActividadSchema.extend({
  opciones: z.array(z.object({
    id: z.string(),
    actividad_id: z.string(),
    etiqueta: z.string().nullable(),
    texto: z.string(),
    correcta: z.boolean(),
    orden: z.number(),
    retroalimentacion: z.string().nullable(),
  })),
  tipo_actividad: z.object({
    id: z.string(),
    codigo: z.string(),
    nombre: z.string(),
  }).nullable(),
  tema: z.object({
    id: z.string(),
    titulo: z.string(),
    slug: z.string(),
    senda: z.object({
      id: z.string(),
      codigo: z.string(),
      nombre: z.string(),
      color_hex: z.string(),
    }).nullable(),
  }).nullable(),
  grupo_edad: z.object({
    id: z.string(),
    codigo: z.string(),
    nombre: z.string(),
  }).nullable(),
  estado: z.string(),
});

export type AdminTema = z.infer<typeof AdminTemaSchema>;
export type AdminTemaDetalle = z.infer<typeof AdminTemaDetalleSchema>;
export type AdminPaso = z.infer<typeof AdminPasoSchema>;
export type AdminActividad = z.infer<typeof AdminActividadSchema>;

// --- Admin Usuario ---
export const AdminUsuarioSchema = z.object({
  id: z.string().uuid(),
  email: z.string().nullable(),
  nickname: z.string().nullable(),
  avatar_url: z.string().nullable(),
  rol: z.string(),
  status: z.string(),
  created_at: z.string().nullable(),
  nivel_actual: z.number().nullable(),
  xp_acumulada: z.number().nullable(),
});

export type AdminUsuario = z.infer<typeof AdminUsuarioSchema>;

// --- Métricas admin ---
export const AdminMetricasSchema = z.object({
  total_temas: z.number(),
  temas_publicados: z.number(),
  borradores: z.number(),
  total_sendas: z.number(),
  total_grupos_edad: z.number(),
  total_pasos: z.number(),
  total_actividades: z.number(),
});

export type AdminMetricas = z.infer<typeof AdminMetricasSchema>;
