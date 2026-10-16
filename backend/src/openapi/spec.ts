import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "@hono/zod-openapi";

extendZodWithOpenApi(z);

const uuidExample = "550e8400-e29b-41d4-a716-446655440000";

const ErrorResponse = z
  .object({
    exito: z.literal(false),
    error: z.string().openapi({ description: "Mensaje legible del error", example: "El campo 'apodo' es requerido" }),
    codigo: z.string().optional().openapi({ description: "Codigo maquina del error", example: "VALIDATION_ERROR" })
  })
  .openapi("ErrorResponse");

const HealthResponse = z
  .object({
    exito: z.literal(true),
    datos: z.object({
      estado: z.string().openapi({ description: "Estado del servidor", example: "healthy" }),
      entorno: z.string().openapi({ description: "Entorno de ejecucion", example: "development" })
    })
  })
  .openapi("HealthResponse");

const RootResponse = z
  .object({
    exito: z.literal(true),
    datos: z.object({
      nombre: z.string().openapi({ description: "Nombre de la API", example: "Semillas" }),
      version: z.string().openapi({ description: "Version semantica", example: "0.1.0" })
    })
  })
  .openapi("RootResponse");

const GuestAuthBody = z.object({
  apodo: z.string().min(1).max(50).openapi({ description: "Apodo publico del usuario", example: "Aventurero123" }),
  grupo_edad_id: z.string().uuid().optional().openapi({ description: "ID del grupo etario", example: uuidExample }),
  url_avatar: z.string().url().optional().openapi({ description: "URL del avatar por defecto", example: "https://api.semillas.app/avatars/default.png" })
}).openapi("GuestAuthBody");

const AuthInfo = z.object({
  tipo: z.literal("invitado"),
  encabezado: z.literal("x-guest-user-id"),
  valor: z.string().uuid().openapi({ description: "ID público del usuario invitado", example: uuidExample }),
  encabezado_token: z.literal("x-guest-token"),
  token: z.string().min(32).openapi({ description: "Secreto de sesión mostrado una sola vez" })
});

const GuestAuthResponse = z.object({
  exito: z.literal(true),
  datos: z.object({
    usuario: z.object({
      id: z.string().uuid().openapi({ description: "ID del usuario", example: uuidExample }),
      rol: z.string().openapi({ description: "Rol del usuario", example: "invitado" }),
      proveedor: z.string().openapi({ description: "Proveedor de autenticacion", example: "invitado" }),
      nombre_visible: z.string().openapi({ description: "Nombre visible", example: "Aventurero123" }),
      correo: z.string().nullable().openapi({ description: "Correo electronico", example: null })
    }),
    perfil: z.object({
      id: z.string().uuid().openapi({ description: "ID del perfil", example: uuidExample }),
      usuario_id: z.string().uuid().openapi({ description: "ID del usuario dueno del perfil", example: uuidExample }),
      apodo: z.string().openapi({ description: "Apodo", example: "Aventurero123" }),
      grupo_edad_id: z.string().uuid().nullable().openapi({ description: "ID del grupo etario", example: null }),
      url_avatar: z.string().nullable().openapi({ description: "URL del avatar", example: null }),
      clave_avatar: z.string().nullable().openapi({ description: "Clave del avatar", example: null }),
      prefiere_audio: z.boolean().openapi({ description: "Prefiere audio", example: true }),
      tamano_texto_preferido: z.string().openapi({ description: "Tamano de texto preferido", example: "mediano" })
    }),
    autenticacion: AuthInfo
  })
}).openapi("GuestAuthResponse");

const SendaSchema = z.object({
  id: z.string().uuid().openapi({ description: "ID unico de la senda", example: uuidExample }),
  codigo: z.string().openapi({ description: "Codigo identificador", example: "PADRE" }),
  nombre: z.string().openapi({ description: "Nombre de la senda", example: "Padre" }),
  descripcion: z.string().nullable().openapi({ description: "Descripcion", example: "Senda del Padre Celestial" }),
  color_hex: z.string().openapi({ description: "Color representativo en hex", example: "#3D8BD4" }),
  nombre_icono: z.string().nullable().openapi({ description: "Nombre del icono asociado", example: "heart" }),
  orden: z.number().openapi({ description: "Orden de visualizacion", example: 1 })
}).openapi("Senda");

const GrupoEdadSchema = z.object({
  codigo: z.string().openapi({ description: "Codigo del grupo", example: "SEMILLAS" }),
  nombre: z.string().openapi({ description: "Nombre del grupo", example: "Semillas 5-8" }),
  edad_minima: z.number().openapi({ description: "Edad minima", example: 5 }),
  edad_maxima: z.number().openapi({ description: "Edad maxima", example: 8 }),
  descripcion: z.string().nullable().openapi({ description: "Descripcion del grupo", example: "Ninos de 5 a 8 anos" }),
  orden: z.number().openapi({ description: "Orden de visualizacion", example: 1 })
}).openapi("GrupoEdad");

const TemaResumido = z.object({
  id: z.string().uuid().openapi({ description: "ID del tema", example: uuidExample }),
  senda_id: z.string().uuid().openapi({ description: "ID de la senda", example: uuidExample }),
  titulo: z.string().openapi({ description: "Titulo del tema", example: "La Creacion" }),
  slug: z.string().openapi({ description: "Slug URL-friendly", example: "la-creacion" }),
  objetivo: z.string().openapi({ description: "Objetivo de aprendizaje", example: "Que el nino entienda que Dios creo todo" }),
  resumen: z.string().nullable().openapi({ description: "Resumen breve", example: "Dios creo el mundo en 7 dias" }),
  portada_recurso_id: z.string().uuid().nullable().openapi({ description: "Recurso de portada", example: null }),
  estado: z.string().openapi({ description: "Estado del tema", example: "publicado" }),
  version_biblica_id: z.string().uuid().nullable().openapi({ description: "Version biblica", example: null }),
  minutos_estimados: z.number().openapi({ description: "Duracion estimada en minutos", example: 15 }),
  xp_recompensa: z.number().openapi({ description: "XP que otorga al completarlo", example: 50 }),
  version_contenido: z.number().openapi({ description: "Version del contenido", example: 1 }),
  publicado_en: z.string().datetime().nullable().openapi({ description: "Fecha de publicacion", example: null })
}).openapi("TemaResumido");

const RecursoMultimediaSchema = z.object({
  id: z.string().uuid().openapi({ description: "ID del recurso multimedia", example: uuidExample }),
  tipo: z.string().openapi({ description: "Tipo del recurso", example: "imagen" }),
  url_publica: z.string().url().openapi({ description: "URL publica", example: "https://cdn.ejemplo.com/portada.png" }),
  texto_alternativo: z.string().nullable().openapi({ description: "Texto alternativo", example: "Portada del tema" }),
  titulo: z.string().nullable().openapi({ description: "Titulo del recurso", example: "Portada" }),
  tipo_mime: z.string().nullable().openapi({ description: "Tipo MIME", example: "image/png" }),
  tamano_bytes: z.number().nullable().openapi({ description: "Tamano en bytes", example: 102400 }),
  duracion_seg: z.number().nullable().openapi({ description: "Duracion en segundos", example: null }),
  ancho_px: z.number().nullable().openapi({ description: "Ancho en pixeles", example: 1280 }),
  alto_px: z.number().nullable().openapi({ description: "Alto en pixeles", example: 720 })
}).openapi("RecursoMultimedia");

const VersiculoClaveSchema = z.object({
  id: z.string().uuid().openapi({ description: "ID del versiculo clave", example: uuidExample }),
  tema_id: z.string().uuid().openapi({ description: "ID del tema", example: uuidExample }),
  texto: z.string().openapi({ description: "Texto del versiculo", example: "En el principio creo Dios los cielos y la tierra." }),
  libro_id: z.number().openapi({ description: "ID del libro biblico", example: 1 }),
  capitulo: z.number().openapi({ description: "Numero de capitulo", example: 1 }),
  versiculo: z.number().openapi({ description: "Numero de versiculo", example: 1 })
}).openapi("VersiculoClave");

const ReferenciaBiblicaSchema = z.object({
  id: z.string().uuid().openapi({ description: "ID de la referencia biblica", example: uuidExample }),
  tema_id: z.string().uuid().openapi({ description: "ID del tema", example: uuidExample }),
  libro_id: z.number().openapi({ description: "ID del libro biblico", example: 1 }),
  capitulo: z.number().openapi({ description: "Numero de capitulo", example: 1 }),
  versiculo_inicio: z.number().openapi({ description: "Versiculo inicial", example: 1 }),
  versiculo_fin: z.number().openapi({ description: "Versiculo final", example: 3 }),
  principal: z.boolean().openapi({ description: "Indica si es la referencia principal", example: true })
}).openapi("ReferenciaBiblica");

const TemaDetallado = TemaResumido.extend({
  senda: SendaSchema.nullable(),
  portada_recurso: RecursoMultimediaSchema.nullable(),
  versiculo_clave: VersiculoClaveSchema.nullable(),
  referencia_biblica: ReferenciaBiblicaSchema.nullable()
}).openapi("TemaDetallado");

const ProgresoTema = z.object({
  usuario_id: z.string().uuid(),
  tema_id: z.string().uuid(),
  estado: z.string().openapi({ description: "Estado del progreso", example: "en_progreso" }),
  porcentaje: z.number().openapi({ description: "Porcentaje de avance 0-100", example: 50 }),
  iniciado_en: z.string().datetime().nullable(),
  completado_en: z.string().datetime().nullable(),
  ultimo_paso_id: z.string().uuid().nullable(),
  actualizado_en: z.string().datetime()
}).openapi("ProgresoTema");

const ProgresoActividad = z.object({
  usuario_id: z.string().uuid(),
  actividad_id: z.string().uuid(),
  intentos: z.number().openapi({ description: "Numero de intentos", example: 2 }),
  mejor_puntaje: z.number().openapi({ description: "Mejor puntaje obtenido", example: 100 }),
  completado: z.boolean(), completado_en: z.string().datetime().nullable(),
  actualizado_en: z.string().datetime()
}).openapi("ProgresoActividad");

const ProgressEventBody = z.object({
  evento_id_cliente: z.string().uuid().openapi({ description: "ID unico del evento (idempotencia)", example: uuidExample }),
  tipo_evento: z.enum(["tema_iniciado","tema_completado","bloque_iniciado","bloque_completado","actividad_iniciada","actividad_respondida","actividad_completada","recompensa_reclamada","tema_descargado","marcador_sincronizacion"])
    .openapi({ description: "Tipo de evento de progreso", example: "actividad_respondida" }),
  tema_id: z.string().uuid().optional(),
  paso_id: z.string().uuid().optional(),
  actividad_id: z.string().uuid().optional(),
  correcta: z.boolean().optional().openapi({ description: "Dato informativo del cliente; el servidor lo ignora para validar respuestas" }),
  puntaje: z.number().min(0).max(100).optional().openapi({ description: "Dato informativo del cliente; el servidor no lo usa como autoridad" }),
  xp_otorgada: z.number().int().min(0).optional().default(0).openapi({ description: "Valor no confiable: el servidor lo ignora y calcula las recompensas", example: 0 }),
  datos: z.object({}).passthrough().optional(),
  ocurrido_en_cliente: z.string().datetime().optional().openapi({ example: "2026-01-01T00:00:00.000Z" }),
  dispositivo_id: z.string().optional()
}).openapi("ProgressEventBody");

const ProgressEventCreatedResponse = z.object({
  exito: z.literal(true),
  datos: z.object({
    duplicado: z.literal(false),
    evento: z.unknown()
  })
});

const ProgressEventDuplicateResponse = z.object({
  exito: z.literal(true),
  datos: z.object({
    duplicado: z.literal(true),
    mensaje: z.string()
  })
});

const TipoActividadSchema = z
  .object({
    id: z.string().uuid().openapi({ description: "ID del tipo de actividad", example: uuidExample }),
    codigo: z.string().openapi({ description: "Codigo del tipo de actividad", example: "QUIZ" }),
    nombre: z.string().openapi({ description: "Nombre del tipo de actividad", example: "Quiz" }),
    descripcion: z.string().nullable().openapi({ description: "Descripcion del tipo de actividad", example: "Pregunta de seleccion multiple" }),
    es_juego: z.boolean().openapi({ description: "Indica si es un juego", example: true }),
    activo: z.boolean().openapi({ description: "Indica si esta activo", example: true }),
    creado_en: z.string().datetime().openapi({ description: "Fecha de creacion", example: "2026-01-01T00:00:00.000Z" })
  })
  .openapi("TipoActividad");

const TipoActividadCatalogoSchema = z
  .object({
    codigo: z.string().openapi({ description: "Codigo del tipo de actividad", example: "QUIZ" }),
    nombre: z.string().openapi({ description: "Nombre del tipo de actividad", example: "Quiz" }),
    descripcion: z.string().nullable().openapi({ description: "Descripcion del tipo de actividad", example: "Pregunta de seleccion multiple" }),
    es_juego: z.boolean().openapi({ description: "Indica si es un juego", example: true })
  })
  .openapi("TipoActividadCatalogo");

const ContenidoPasoCrecerSchema = z
  .object({
    id: z.string().uuid().openapi({ description: "ID del contenido CRECER", example: uuidExample }),
    grupo_edad_id: z.string().uuid().openapi({ description: "ID del grupo etario", example: uuidExample }),
    titulo: z.string().openapi({ description: "Titulo del contenido", example: "Conectar" }),
    cuerpo: z.string().openapi({ description: "Cuerpo del contenido", example: "Conecta con la historia biblica" }),
    instruccion_corta: z.string().nullable().openapi({ description: "Instruccion corta", example: "Mira y escucha" })
  })
  .openapi("ContenidoPasoCrecer");

const OpcionActividadSchema = z.object({
  id: z.string().uuid(),
  actividad_id: z.string().uuid(),
  texto: z.string().openapi({ example: "Dios" }),
  orden: z.number(),
  etiqueta: z.string().nullable().openapi({ example: "A" })
}).openapi("OpcionActividad");

const ActividadSchema = z.object({
  id: z.string().uuid(), tema_id: z.string().uuid(), paso_id: z.string().uuid().nullable(),
  tipo_actividad_id: z.string().uuid(), grupo_edad_id: z.string().uuid(),
  titulo: z.string().openapi({ example: "Quien creo el mundo?" }),
  consigna: z.string().openapi({ example: "Selecciona la respuesta correcta" }),
  orden: z.number(), xp_recompensa: z.number().openapi({ example: 15 }),
  dificultad: z.string().openapi({ example: "facil" }),
  limite_tiempo_seg: z.number().nullable().openapi({ example: 30 }),
  obligatorio: z.boolean(), retroalimentacion: z.string().nullable(),
  configuracion: z.object({}).passthrough(),
  creado_en: z.string().datetime(), actualizado_en: z.string().datetime(),
  tipo_actividad: TipoActividadSchema.nullable(),
  opciones: z.array(OpcionActividadSchema)
}).openapi("Actividad");

const PasoCrecerCatalogoSchema = z
  .object({
    codigo: z.string().openapi({ description: "Codigo del paso CRECER", example: "CONECTAR" }),
    nombre: z.string().openapi({ description: "Nombre del paso CRECER", example: "Conectar" }),
    descripcion: z.string().nullable().openapi({ description: "Descripcion del paso CRECER", example: "Conecta con la historia biblica" }),
    orden: z.number().openapi({ description: "Orden de visualizacion", example: 1 }),
    color_hex: z.string().nullable().openapi({ description: "Color representativo", example: "#3D8BD4" })
  })
  .openapi("PasoCrecerCatalogo");

const PasoTemaCrecerSchema = z
  .object({
    id: z.string().uuid().openapi({ description: "ID del paso del tema", example: uuidExample }),
    tema_id: z.string().uuid().openapi({ description: "ID del tema", example: uuidExample }),
    orden: z.number().openapi({ description: "Orden del paso", example: 1 }),
    tipo_paso: z
      .object({
        id: z.string().uuid().openapi({ description: "ID del tipo de paso", example: uuidExample }),
        codigo: z.string().openapi({ description: "Codigo del tipo de paso", example: "CONECTAR" }),
        nombre: z.string().openapi({ description: "Nombre del tipo de paso", example: "Conectar" }),
        orden: z.number().openapi({ description: "Orden del tipo de paso", example: 1 }),
        color_hex: z.string().nullable().openapi({ description: "Color del tipo de paso", example: "#3D8BD4" })
      })
      .nullable(),
    contenidos: z.array(ContenidoPasoCrecerSchema)
  })
  .openapi("PasoTemaCrecer");

const PaqueteOfflineBody = z.object({
  grupo_edad_id: z.string().uuid().openapi({ description: "Grupo etario usado para adaptar contenido", example: uuidExample })
}).openapi("PaqueteOfflineBody");

const RecursoOfflineSchema = z.object({
  id: z.string().uuid(),
  tipo: z.string(),
  url_descarga: z.string().url(),
  tipo_mime: z.string().nullable(),
  tamano_bytes: z.number().int().nullable(),
  titulo: z.string().nullable(),
  texto_alternativo: z.string().nullable(),
  duracion_seg: z.number().nullable(),
  ancho_px: z.number().nullable(),
  alto_px: z.number().nullable()
}).passthrough().openapi("RecursoOffline");

const PaqueteOfflineResponse = z.object({
  exito: z.literal(true),
  datos: z.object({
    paquete_id: z.string().uuid().nullable(),
    tamano_bytes: z.number().int().nonnegative(),
    schema_version: z.number().int(),
    generado_en: z.string().datetime(),
    grupo_edad_id: z.string().uuid(),
    tema: TemaResumido,
    pasos: z.array(PasoTemaCrecerSchema),
    actividades: z.array(ActividadSchema),
    medios: z.array(RecursoOfflineSchema)
  })
}).openapi("PaqueteOfflineResponse");

const ClubSchema = z.object({
  id: z.string().uuid(), nombre: z.string().openapi({ example: "Exploradores de la Fe" }),
  descripcion: z.string().nullable(), codigo_invitacion: z.string().openapi({ example: "ABC12345" }),
  activo: z.boolean(), creado_por: z.string().uuid(), creado_en: z.string().datetime(),
  member_count: z.number().int().nonnegative().optional()
}).openapi("Club");

const ClubPublicoSchema = ClubSchema.omit({ codigo_invitacion: true })
  .extend({ member_count: z.number().int().nonnegative() })
  .openapi("ClubPublico");

const ReporteClubSchema = z.object({
  id: z.string().uuid(),
  club_id: z.string().uuid(),
  reportado_por: z.string().uuid(),
  reportado_usuario_id: z.string().uuid(),
  categoria: z.enum(["contenido_inapropiado", "acoso", "datos_personales", "otro"]),
  detalle: z.string().nullable(),
  estado: z.enum(["abierto", "en_revision", "resuelto", "descartado"]),
  resuelto_por: z.string().uuid().nullable(),
  nota_resolucion: z.string().nullable(),
  creado_en: z.string().datetime(),
  actualizado_en: z.string().datetime(),
}).openapi("ReporteClub");

const CrearReporteClubBody = z.object({
  miembro_token: z.string().uuid().openapi({ description: "Token público opaco de la membresía reportada" }),
  categoria: z.enum(["contenido_inapropiado", "acoso", "datos_personales", "otro"]),
  detalle: z.string().max(500).optional(),
}).openapi("CrearReporteClubBody");

const ResolverReporteClubBody = z.object({
  estado: z.enum(["en_revision", "resuelto", "descartado"]),
  nota: z.string().max(500).optional(),
}).openapi("ResolverReporteClubBody");

const NivelUsuario = z.object({
  usuario_id: z.string().uuid().nullable(),
  xp_total: z.number().nullable().openapi({ example: 1500 }),
  numero_nivel: z.number().nullable().openapi({ example: 3 }),
  nombre_nivel: z.string().nullable().openapi({ example: "Explorador" })
}).openapi("NivelUsuario");

const LogroSchema = z.object({
  id: z.string().uuid(), codigo: z.string().openapi({ example: "PRIMER_TEMA" }),
  nombre: z.string(), descripcion: z.string().nullable(),
  codigo_criterio: z.string(), valor_criterio: z.number().nullable(),
  bono_xp: z.number().openapi({ example: 50 }),
  url_icono: z.string().nullable(), activo: z.boolean(), creado_en: z.string().datetime()
}).openapi("Logro");

const LogroUsuario = z.object({
  usuario_id: z.string().uuid(), logro_id: z.string().uuid(),
  ganado_en: z.string().datetime(), logro: LogroSchema.optional()
}).openapi("LogroUsuario");

const UpdateProfileBody = z.object({
  apodo: z.string().min(2).max(40).optional().openapi({ example: "Semillero123" }),
  grupo_edad_id: z.string().uuid().nullable().optional(),
  url_avatar: z.string().url().nullable().optional(),
  prefiere_audio: z.boolean().optional(),
  tamano_texto_preferido: z.enum(["pequeno","mediano","grande"]).optional().openapi({ example: "mediano" })
}).openapi("UpdateProfileBody");

const ProfileResponse = z.object({
  id: z.string().uuid(),
  usuario_id: z.string().uuid(),
  apodo: z.string(),
  url_avatar: z.string().nullable(),
  clave_avatar: z.string().nullable(),
  grupo_edad_id: z.string().uuid().nullable(),
  prefiere_audio: z.boolean(),
  tamano_texto_preferido: z.string(),
  creado_en: z.string().datetime(),
  actualizado_en: z.string().datetime()
}).openapi("ProfileResponse");

// ─── Admin schemas ──────────────────────────────────────────────────────

const AdminResumen = z.object({
  temas: z.number().openapi({ description: "Total de temas", example: 10 }),
  publicados: z.number().openapi({ description: "Temas publicados", example: 5 }),
  usuarios: z.number().openapi({ description: "Total de usuarios", example: 100 }),
  actividades: z.number().openapi({ description: "Total de actividades", example: 50 })
}).openapi("AdminResumen");

const AdminUserItem = z.object({
  id: z.string().uuid().openapi({ description: "ID del usuario", example: uuidExample }),
  rol: z.string().openapi({ description: "Rol del usuario", example: "usuario" }),
  proveedor: z.string().openapi({ description: "Proveedor de autenticacion", example: "invitado" }),
  nombre_visible: z.string().openapi({ description: "Nombre visible del usuario", example: "Aventurero123" }),
  correo: z.string().nullable().openapi({ description: "Correo electronico", example: null }),
  activo: z.boolean().openapi({ description: "Si el usuario esta activo", example: true }),
  creado_en: z.string().datetime().openapi({ description: "Fecha de creacion", example: "2026-01-01T00:00:00.000Z" }),
  actualizado_en: z.string().datetime().openapi({ description: "Fecha de actualizacion", example: "2026-01-01T00:00:00.000Z" }),
  ultimo_login_en: z.string().datetime().nullable().openapi({ description: "Ultimo inicio de sesion", example: null }),
  perfil: z.unknown().openapi({ description: "Perfil del usuario" })
}).openapi("AdminUserItem");

const AdminUpdateUserBody = z.object({
  rol: z.enum(["administrador", "usuario", "invitado", "padre"]).optional().openapi({ description: "Nuevo rol del usuario", example: "usuario" }),
  nombre_visible: z.string().min(2).max(60).optional().openapi({ description: "Nuevo nombre visible", example: "AventureroActualizado" })
}).openapi("AdminUpdateUserBody");

const AdminUserDeletedResponse = z.object({
  exito: z.literal(true),
  datos: z.object({
    eliminado: z.literal(true)
  })
}).openapi("AdminUserDeletedResponse");

const AdminCreateThemeBody = z.object({
  senda_id: z.string().uuid().openapi({ description: "ID de la senda", example: uuidExample }),
  titulo: z.string().min(3).max(120).openapi({ description: "Titulo del tema", example: "La Creacion" }),
  slug: z.string().min(3).max(140).openapi({ description: "Slug URL-friendly", example: "la-creacion" }),
  objetivo: z.string().min(10).openapi({ description: "Objetivo de aprendizaje", example: "Que el nino entienda que Dios creo todo" }),
  resumen: z.string().min(10).openapi({ description: "Resumen breve", example: "Dios creo el mundo en 7 dias" }),
  version_biblica_id: z.string().uuid().openapi({ description: "ID de la version biblica", example: uuidExample }),
  minutos_estimados: z.number().int().min(1).max(120).openapi({ description: "Duracion estimada en minutos", example: 15 }),
  xp_recompensa: z.number().int().min(0).max(500).openapi({ description: "XP que otorga al completarlo", example: 50 }),
  grupo_edad_ids: z.array(z.string().uuid()).min(1).openapi({ description: "IDs de grupos etarios", example: [uuidExample] })
}).openapi("AdminCreateThemeBody");

const AdminUpdateThemeBody = z.object({
  titulo: z.string().min(3).max(120).optional().openapi({ description: "Titulo del tema", example: "La Creacion" }),
  objetivo: z.string().min(10).optional().openapi({ description: "Objetivo de aprendizaje", example: "Que el nino entienda que Dios creo todo" }),
  resumen: z.string().min(10).optional().openapi({ description: "Resumen breve", example: "Dios creo el mundo en 7 dias" }),
  minutos_estimados: z.number().int().min(1).max(120).optional().openapi({ description: "Duracion estimada en minutos", example: 15 }),
  xp_recompensa: z.number().int().min(0).max(500).optional().openapi({ description: "XP que otorga al completarlo", example: 50 }),
  version_biblica_id: z.string().uuid().optional().openapi({ description: "ID de la version biblica", example: uuidExample }),
  grupo_edad_ids: z.array(z.string().uuid()).min(1).optional().openapi({ description: "IDs de grupos etarios", example: [uuidExample] })
}).openapi("AdminUpdateThemeBody");

const AdminUpsertStepBody = z.object({
  tipo_paso_id: z.string().uuid().openapi({ description: "ID del tipo de paso CRECER", example: uuidExample }),
  grupo_edad_id: z.string().uuid().openapi({ description: "ID del grupo etario", example: uuidExample }),
  titulo: z.string().min(2).max(120).openapi({ description: "Titulo del contenido", example: "Conectar" }),
  cuerpo: z.string().min(5).openapi({ description: "Cuerpo del contenido en markdown", example: "Conecta con la historia biblica..." }),
  instruccion_corta: z.string().optional().openapi({ description: "Instruccion corta", example: "Mira y escucha" })
}).openapi("AdminUpsertStepBody");

const AdminCreateActivityBody = z.object({
  tema_id: z.string().uuid().openapi({ description: "ID del tema", example: uuidExample }),
  paso_id: z.string().uuid().nullable().optional().openapi({ description: "ID del paso CRECER", example: uuidExample }),
  grupo_edad_id: z.string().uuid().openapi({ description: "ID del grupo etario", example: uuidExample }),
  tipo_actividad_id: z.string().uuid().openapi({ description: "ID del tipo de actividad", example: uuidExample }),
  titulo: z.string().min(3).openapi({ description: "Titulo de la actividad", example: "Quien creo el mundo?" }),
  consigna: z.string().min(3).openapi({ description: "Consigna o instruccion", example: "Selecciona la respuesta correcta" }),
  retroalimentacion: z.string().optional().openapi({ description: "Retroalimentacion", example: "Muy bien!" }),
  orden: z.number().int().min(1).openapi({ description: "Orden de visualizacion", example: 1 }),
  xp_recompensa: z.number().int().min(0).openapi({ description: "XP que otorga", example: 15 }),
  limite_tiempo_seg: z.number().int().positive().nullable().optional().openapi({ description: "Limite de tiempo en segundos", example: 30 }),
  dificultad: z.enum(["facil", "normal", "dificil"]).openapi({ description: "Dificultad", example: "facil" }),
  obligatorio: z.boolean().openapi({ description: "Si es obligatoria", example: true }),
  configuracion: z.record(z.string(), z.unknown()).openapi({ description: "Configuracion adicional", example: {} }),
  opciones: z.array(z.object({
    etiqueta: z.string().max(5).openapi({ description: "Etiqueta de la opcion", example: "A" }),
    texto: z.string().min(1).openapi({ description: "Texto de la opcion", example: "Dios" }),
    correcta: z.boolean().openapi({ description: "Si es la respuesta correcta", example: true }),
    orden: z.number().int().min(1).openapi({ description: "Orden de la opcion", example: 1 }),
    retroalimentacion: z.string().optional().openapi({ description: "Retroalimentacion", example: "Correcto!" })
  })).openapi({ description: "Opciones de respuesta" })
}).openapi("AdminCreateActivityBody");

const AdminUpdateActivityBody = z.object({
  tema_id: z.string().uuid().optional().openapi({ description: "ID del tema", example: uuidExample }),
  paso_id: z.string().uuid().nullable().optional().openapi({ description: "ID del paso CRECER", example: uuidExample }),
  grupo_edad_id: z.string().uuid().optional().openapi({ description: "ID del grupo etario", example: uuidExample }),
  tipo_actividad_id: z.string().uuid().optional().openapi({ description: "ID del tipo de actividad", example: uuidExample }),
  titulo: z.string().min(3).optional().openapi({ description: "Titulo de la actividad", example: "Quien creo el mundo?" }),
  consigna: z.string().min(3).optional().openapi({ description: "Consigna o instruccion", example: "Selecciona la respuesta correcta" }),
  retroalimentacion: z.string().optional().openapi({ description: "Retroalimentacion", example: "Muy bien!" }),
  orden: z.number().int().min(1).optional().openapi({ description: "Orden de visualizacion", example: 1 }),
  xp_recompensa: z.number().int().min(0).optional().openapi({ description: "XP que otorga", example: 15 }),
  limite_tiempo_seg: z.number().int().positive().nullable().optional().openapi({ description: "Limite de tiempo en segundos", example: 30 }),
  dificultad: z.enum(["facil", "normal", "dificil"]).optional().openapi({ description: "Dificultad", example: "facil" }),
  obligatorio: z.boolean().optional().openapi({ description: "Si es obligatoria", example: true }),
  configuracion: z.record(z.string(), z.unknown()).optional().openapi({ description: "Configuracion adicional", example: {} }),
  opciones: z.array(z.object({
    etiqueta: z.string().max(5).openapi({ description: "Etiqueta de la opcion", example: "A" }),
    texto: z.string().min(1).openapi({ description: "Texto de la opcion", example: "Dios" }),
    correcta: z.boolean().openapi({ description: "Si es la respuesta correcta", example: true }),
    orden: z.number().int().min(1).openapi({ description: "Orden de la opcion", example: 1 }),
    retroalimentacion: z.string().optional().openapi({ description: "Retroalimentacion", example: "Correcto!" })
  })).optional().openapi({ description: "Opciones de respuesta" })
}).openapi("AdminUpdateActivityBody");

const AdminActivityOption = z.object({
  id: z.string().uuid(),
  actividad_id: z.string().uuid(),
  etiqueta: z.string().nullable(),
  texto: z.string(),
  correcta: z.boolean(),
  orden: z.number().int(),
  retroalimentacion: z.string().nullable()
}).openapi("AdminActivityOption");

const AdminActivityItem = z.object({
  id: z.string().uuid(),
  tema_id: z.string().uuid(),
  paso_id: z.string().uuid().nullable(),
  grupo_edad_id: z.string().uuid(),
  tipo_actividad_id: z.string().uuid(),
  titulo: z.string(),
  consigna: z.string(),
  retroalimentacion: z.string().nullable(),
  orden: z.number().int(),
  xp_recompensa: z.number().int(),
  limite_tiempo_seg: z.number().int().nullable(),
  dificultad: z.string(),
  obligatorio: z.boolean(),
  configuracion: z.record(z.string(), z.unknown()),
  opciones: z.array(AdminActivityOption),
  estado: z.string(),
  creado_en: z.string().datetime().nullable(),
  actualizado_en: z.string().datetime().nullable(),
  tipo_actividad: z.object({ id: z.string().uuid(), codigo: z.string(), nombre: z.string() }).nullable(),
  tema: z.object({
    id: z.string().uuid(),
    titulo: z.string(),
    slug: z.string(),
    senda: z.object({ id: z.string().uuid(), codigo: z.string(), nombre: z.string(), color_hex: z.string() }).nullable()
  }).nullable(),
  grupo_edad: z.object({ id: z.string().uuid(), codigo: z.string(), nombre: z.string() }).nullable()
}).openapi("AdminActivityItem");

const AdminStepWithContentResponse = z.object({
  exito: z.literal(true),
  datos: z.object({
    paso: PasoTemaCrecerSchema,
    contenido: z.object({
      id: z.string().uuid().openapi({ example: uuidExample }),
      paso_id: z.string().uuid().openapi({ example: uuidExample }),
      grupo_edad_id: z.string().uuid().openapi({ example: uuidExample }),
      titulo: z.string().openapi({ example: "Conectar" }),
      cuerpo: z.string().openapi({ example: "Contenido del paso..." }),
      instruccion_corta: z.string().nullable().openapi({ example: "Mira y escucha" })
    })
  })
}).openapi("AdminStepWithContentResponse");

const DeletedResponse = z.object({
  exito: z.literal(true),
  datos: z.object({
    deleted: z.literal(true)
  })
}).openapi("DeletedResponse");

// ─── Auth dev schema ──────────────────────────────────────────────────

const AuthDevResponse = z.object({
  exito: z.literal(true),
  datos: z.object({
    usuario: z.object({
      id: z.string().uuid().openapi({ example: uuidExample }),
      rol: z.string().openapi({ example: "administrador" }),
      proveedor: z.string().openapi({ example: "invitado" }),
      nombre_visible: z.string().openapi({ example: "Admin Dev" }),
      correo: z.string().nullable().openapi({ example: null })
    }),
    perfil: ProfileResponse,
    mensaje: z.string().openapi({ description: "Mensaje informativo", example: "Administrador creado. Usa este ID para autenticar solicitudes durante desarrollo." })
  })
}).openapi("AuthDevResponse");

// ─── Actividades schemas ──────────────────────────────────────────────

const LogroDesbloqueadoSchema = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nombre: z.string(),
  bono_xp: z.number().int().nonnegative()
}).openapi("LogroDesbloqueado");

const ResponderActividadBody = z.object({
  evento_id_cliente: z.string().uuid().openapi({ description: "ID unico del evento (idempotencia)", example: uuidExample }),
  opcion_id_seleccionada: z.string().uuid().optional().openapi({ description: "ID de la opcion seleccionada", example: uuidExample }),
  texto_respuesta: z.string().optional().openapi({ description: "Texto de respuesta libre", example: "Dios" }),
  ocurrido_en_cliente: z.string().datetime().optional().openapi({ description: "Fecha del evento en el cliente", example: "2026-01-01T00:00:00.000Z" }),
  dispositivo_id: z.string().optional().openapi({ description: "ID del dispositivo", example: "device-123" })
}).openapi("ResponderActividadBody");

const ResponderActividadResponse = z.object({
  exito: z.literal(true),
  datos: z.object({
    resultado: z.object({
      correcta: z.boolean().openapi({ example: true }),
      xp_otorgada: z.number().openapi({ example: 15 }),
      opcion_correcta_id: z.string().uuid().nullable().openapi({ example: uuidExample }),
      retroalimentacion: z.string().nullable().openapi({ example: "¡Muy bien!" })
    }),
    duplicado: z.boolean().openapi({ example: false }),
    correcta: z.boolean().openapi({ example: true }),
    xp_otorgada: z.number().int().nonnegative().openapi({ example: 15 }),
    logros_desbloqueados: z.array(LogroDesbloqueadoSchema)
  })
}).openapi("ResponderActividadResponse");

// ─── Clubes schemas ────────────────────────────────────────────────────

const ClubDetallado = z.object({
  id: z.string().uuid().openapi({ example: uuidExample }),
  nombre: z.string().openapi({ example: "Exploradores de la Fe" }),
  descripcion: z.string().nullable().openapi({ example: "Club para aprender juntos" }),
  codigo_invitacion: z.string().openapi({ example: "ABC12345" }),
  activo: z.boolean().openapi({ example: true }),
  creado_por: z.string().uuid().openapi({ example: uuidExample }),
  creado_en: z.string().datetime().openapi({ example: "2026-01-01T00:00:00.000Z" }),
  created_by: z.object({
    id: z.string().uuid(),
    nombre_visible: z.string()
  }).nullable().openapi({ description: "Creador del club" }),
  members: z.array(z.object({
    club_id: z.string().uuid(),
    usuario_id: z.string().uuid(),
    rol_miembro: z.string().openapi({ example: "lider" }),
    unido_en: z.string().datetime()
  })).openapi({ description: "Miembros del club" })
}).openapi("ClubDetallado");

const CreateClubBody = z.object({
  nombre: z.string().min(3).max(80).openapi({ description: "Nombre del club", example: "Exploradores de la Fe" }),
  descripcion: z.string().max(300).optional().openapi({ description: "Descripción del club", example: "Club para aprender juntos" })
}).openapi("CreateClubBody");

const JoinClubBody = z.object({
  codigo_acceso: z.string().min(4).max(20).openapi({ description: "Código de invitación", example: "ABC12345" })
}).openapi("JoinClubBody");

const ClubRankingEntry = z.object({
  club_id: z.string().uuid().openapi({ example: uuidExample }),
  usuario_id: z.string().uuid().openapi({ example: uuidExample }),
  apodo: z.string().openapi({ example: "Aventurero123" }),
  xp_total: z.number().openapi({ example: 1500 }),
  numero_ranking: z.number().openapi({ description: "Posicion en el ranking", example: 1 })
}).openapi("ClubRankingEntry");

const RetoClub = z.object({
  id: z.string().uuid().openapi({ example: uuidExample }),
  club_id: z.string().uuid().openapi({ example: uuidExample }),
  nombre: z.string().openapi({ example: "Leer 10 temas" }),
  descripcion: z.string().nullable().openapi({ example: "Completa 10 temas esta semana" }),
  codigo_metrica: z.string().openapi({ example: "TEMAS_COMPLETADOS" }),
  valor_objetivo: z.number().openapi({ example: 10 }),
  xp_reto: z.number().openapi({ example: 200 }),
  fecha_inicio: z.string().datetime().openapi({ example: "2026-01-01T00:00:00.000Z" }),
  fecha_fin: z.string().datetime().openapi({ example: "2026-01-07T00:00:00.000Z" }),
  creado_por: z.string().uuid().openapi({ example: uuidExample }),
  creado_en: z.string().datetime().openapi({ example: "2026-01-01T00:00:00.000Z" })
}).openapi("RetoClub");

const CreateRetoBody = z.object({
  nombre: z.string().min(3).max(120).openapi({ description: "Nombre del reto", example: "Leer 10 temas" }),
  descripcion: z.string().max(300).optional().openapi({ description: "Descripción del reto", example: "Completa 10 temas esta semana" }),
  codigo_metrica: z.string().min(2).openapi({ description: "Código de métrica", example: "TEMAS_COMPLETADOS" }),
  valor_objetivo: z.number().int().min(1).openapi({ description: "Valor objetivo", example: 10 }),
  xp_reto: z.number().int().min(0).default(100).openapi({ description: "XP de recompensa", example: 200 }),
  fecha_inicio: z.string().datetime().openapi({ description: "Fecha de inicio", example: "2026-01-01T00:00:00.000Z" }),
  fecha_fin: z.string().datetime().openapi({ description: "Fecha de fin", example: "2026-01-07T00:00:00.000Z" })
}).openapi("CreateRetoBody");

const registry = new OpenAPIRegistry();
registry.register("ErrorResponse", ErrorResponse);
registry.register("HealthResponse", HealthResponse);
registry.register("RootResponse", RootResponse);
registry.register("GuestAuthBody", GuestAuthBody);
registry.register("GuestAuthResponse", GuestAuthResponse);
registry.register("Senda", SendaSchema);
registry.register("GrupoEdad", GrupoEdadSchema);
registry.register("TemaResumido", TemaResumido);
registry.register("TemaDetallado", TemaDetallado);
registry.register("RecursoMultimedia", RecursoMultimediaSchema);
registry.register("VersiculoClave", VersiculoClaveSchema);
registry.register("ReferenciaBiblica", ReferenciaBiblicaSchema);
registry.register("TipoActividad", TipoActividadSchema);
registry.register("TipoActividadCatalogo", TipoActividadCatalogoSchema);
registry.register("ContenidoPasoCrecer", ContenidoPasoCrecerSchema);
registry.register("PasoCrecerCatalogo", PasoCrecerCatalogoSchema);
registry.register("PasoTemaCrecer", PasoTemaCrecerSchema);
registry.register("Actividad", ActividadSchema);
registry.register("ProgresoTema", ProgresoTema);
registry.register("ProgresoActividad", ProgresoActividad);
registry.register("ProgressEventBody", ProgressEventBody);
registry.register("Club", ClubSchema);
registry.register("NivelUsuario", NivelUsuario);
registry.register("LogroUsuario", LogroUsuario);
registry.register("Logro", LogroSchema);
registry.register("UpdateProfileBody", UpdateProfileBody);
registry.register("ProfileResponse", ProfileResponse);

registry.register("AdminResumen", AdminResumen);
registry.register("AdminCreateThemeBody", AdminCreateThemeBody);
registry.register("AdminUpdateThemeBody", AdminUpdateThemeBody);
registry.register("AdminUpsertStepBody", AdminUpsertStepBody);
registry.register("AdminCreateActivityBody", AdminCreateActivityBody);
registry.register("AdminUpdateActivityBody", AdminUpdateActivityBody);
registry.register("AdminStepWithContentResponse", AdminStepWithContentResponse);
registry.register("DeletedResponse", DeletedResponse);
registry.register("AdminUserItem", AdminUserItem);
registry.register("AdminUpdateUserBody", AdminUpdateUserBody);
registry.register("AdminUserDeletedResponse", AdminUserDeletedResponse);
registry.register("AuthDevResponse", AuthDevResponse);
registry.register("ResponderActividadBody", ResponderActividadBody);
registry.register("ResponderActividadResponse", ResponderActividadResponse);
registry.register("LogroDesbloqueado", LogroDesbloqueadoSchema);
registry.register("PaqueteOfflineBody", PaqueteOfflineBody);
registry.register("RecursoOffline", RecursoOfflineSchema);
registry.register("PaqueteOfflineResponse", PaqueteOfflineResponse);
registry.register("ClubDetallado", ClubDetallado);
registry.register("CreateClubBody", CreateClubBody);
registry.register("JoinClubBody", JoinClubBody);
registry.register("ClubRankingEntry", ClubRankingEntry);
registry.register("RetoClub", RetoClub);
registry.register("CreateRetoBody", CreateRetoBody);
registry.register("ReporteClub", ReporteClubSchema);
registry.register("CrearReporteClubBody", CrearReporteClubBody);
registry.register("ResolverReporteClubBody", ResolverReporteClubBody);

registry.registerPath({ method: "get", path: "/", operationId: "getRoot", tags: ["system"], summary: "Raiz de la API",
  description: "Endpoint principal de Semillas", responses: { 200: { content: { "application/json": { schema: RootResponse } }, description: "Informacion de la API" } } });

registry.registerPath({ method: "get", path: "/health", operationId: "healthCheck", tags: ["system"], summary: "Health Check",
  description: "Verifica que la API funcione correctamente", responses: { 200: { content: { "application/json": { schema: HealthResponse } }, description: "API saludable" } } });

registry.registerPath({ method: "post", path: "/autenticacion/invitado", operationId: "createGuestUser", tags: ["auth"], summary: "Crear usuario invitado",
  description: "Crea un usuario invitado. Usar X-Guest-User-Id y X-Guest-Token para autenticar solicitudes posteriores.",
  request: { body: { content: { "application/json": { schema: GuestAuthBody } }, required: true } },
  responses: { 201: { content: { "application/json": { schema: GuestAuthResponse } }, description: "Usuario invitado creado" }, 400: { content: { "application/json": { schema: ErrorResponse } }, description: "Datos invalidos" } } });

registry.registerPath({ method: "get", path: "/catalogo/grupos-etarios", operationId: "listAgeGroups", tags: ["catalogo"],
  summary: "Grupos etarios", description: "Semillas (5-8), Exploradores (9-12), Embajadores (13-17)",
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.array(GrupoEdadSchema) }) } }, description: "Lista de grupos etarios" } } });

registry.registerPath({ method: "get", path: "/catalogo/tipos-actividad", operationId: "listActivityTypes", tags: ["catalogo"],
  summary: "Tipos de actividad", description: "Quiz, flashcards, completar versiculo, etc.",
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.array(TipoActividadCatalogoSchema) }) } }, description: "Lista de tipos" } } });

registry.registerPath({ method: "get", path: "/catalogo/libros-biblicos", operationId: "listBibleBooks", tags: ["catalogo"],
  summary: "Libros biblicos", description: "Listado completo de libros de la Biblia",
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.array(z.object({ codigo: z.string(), nombre: z.string(), orden: z.number(), testamento_id: z.number() })) }) } }, description: "Lista de libros" } } });

registry.registerPath({ method: "get", path: "/catalogo/pasos-crecer", operationId: "listCrecerSteps", tags: ["catalogo"],
  summary: "Pasos CRECER", description: "Conectar, Relatar, Ensenar, Comprobar, Experimentar, Recompensar",
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.array(PasoCrecerCatalogoSchema) }) } }, description: "Lista de pasos CRECER" } } });

registry.registerPath({ method: "get", path: "/catalogo/versiones-biblicas", operationId: "listBibleVersions", tags: ["catalogo"],
  summary: "Versiones biblicas", description: "NVI, RVR60, PDT, etc.",
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.array(z.object({ codigo: z.string(), nombre: z.string(), dominio_publico: z.boolean() })) }) } }, description: "Lista de versiones" } } });

registry.registerPath({ method: "get", path: "/sendas", operationId: "listSendas", tags: ["sendas"],
  summary: "Listar sendas", description: "Padre (azul), Hijo (ambar) y Espiritu Santo (verde)",
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.array(SendaSchema) }) } }, description: "Lista de sendas" } } });

registry.registerPath({ method: "get", path: "/temas", operationId: "listThemes", tags: ["temas"],
  summary: "Listar temas publicos", description: "Filtrable por senda (?senda_id=uuid)",
  request: { query: z.object({ senda_id: z.string().uuid().optional().openapi({ example: uuidExample }) }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.array(TemaResumido) }) } }, description: "Lista de temas" } } });

registry.registerPath({ method: "get", path: "/temas/{tema_id}", operationId: "getTheme", tags: ["temas"],
  summary: "Obtener tema completo", description: "Incluye senda, portada, versiculo clave y referencia biblica",
  request: { params: z.object({ tema_id: z.string().uuid().openapi({ example: uuidExample }) }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: TemaDetallado }) } }, description: "Tema encontrado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "Tema no encontrado" } } });

registry.registerPath({ method: "get", path: "/temas/{tema_id}/pasos", operationId: "getThemeSteps", tags: ["temas"],
  summary: "Pasos CRECER de un tema", description: "Filtrar por grupo etario (?grupo_edad_id=uuid)",
  request: { params: z.object({ tema_id: z.string().uuid() }), query: z.object({ grupo_edad_id: z.string().uuid().optional() }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.array(PasoTemaCrecerSchema) }) } }, description: "Pasos CRECER" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrado" } } });

registry.registerPath({ method: "get", path: "/temas/{tema_id}/actividades", operationId: "getThemeActivities", tags: ["temas"],
  summary: "Actividades de un tema", description: "Filtrar por grupo etario (?grupo_edad_id=uuid)",
  request: { params: z.object({ tema_id: z.string().uuid() }), query: z.object({ grupo_edad_id: z.string().uuid().optional() }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.array(ActividadSchema) }) } }, description: "Actividades del tema" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrado" } } });

registry.registerPath({ method: "post", path: "/temas/{tema_id}/paquete-offline", operationId: "createOfflineThemePackage", tags: ["temas", "sync"],
  summary: "Preparar paquete offline", description: "Devuelve el tema, pasos CRECER, actividades y URLs temporales de todos los medios necesarios. El cliente debe consumir y guardar los medios inmediatamente en Cache Storage/IndexedDB.",
  request: { params: z.object({ tema_id: z.string().uuid() }), body: { content: { "application/json": { schema: PaqueteOfflineBody } }, required: true } },
  responses: { 200: { content: { "application/json": { schema: PaqueteOfflineResponse } }, description: "Paquete listo para descargar" }, 400: { content: { "application/json": { schema: ErrorResponse } }, description: "Grupo etario inválido" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "Tema no encontrado" } } });

registry.registerPath({ method: "get", path: "/actividades/{actividad_id}", operationId: "getActivity", tags: ["actividades"],
  summary: "Obtener actividad", description: "Actividad con opciones de respuesta y tipo",
  request: { params: z.object({ actividad_id: z.string().uuid() }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: ActividadSchema }) } }, description: "Actividad encontrada" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrada" } } });

registry.registerPath({ method: "get", path: "/perfil", operationId: "getMyProfile", tags: ["usuario"],
  summary: "Mi perfil", description: "Perfil completo del usuario autenticado",
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.object({ usuario: z.object({ id: z.string().uuid(), rol: z.string(), proveedor: z.string(), nombre_visible: z.string(), correo: z.string().nullable() }), perfil: ProfileResponse }) }) } }, description: "Perfil del usuario" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" } } });

registry.registerPath({ method: "patch", path: "/perfil/actualizar", operationId: "updateMyProfile", tags: ["usuario"],
  summary: "Actualizar perfil", description: "Actualiza apodo, avatar, grupo etario o preferencias",
  request: { body: { content: { "application/json": { schema: UpdateProfileBody } }, required: true } },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: ProfileResponse }) } }, description: "Perfil actualizado" }, 400: { content: { "application/json": { schema: ErrorResponse } }, description: "Datos invalidos" } } });

registry.registerPath({ method: "post", path: "/perfil/vincular-cuenta", operationId: "linkGuestAccount", tags: ["usuario"],
  summary: "Vincular cuenta invitada", description: "Conserva el UUID, perfil, progreso y recompensas del usuario invitado al completar una sesión autenticada.",
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.object({ vinculada: z.literal(true), usuario: z.unknown(), perfil: z.unknown().nullable() }) }) } }, description: "Cuenta vinculada" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "Sesión invitada o token Bearer inválido" }, 409: { content: { "application/json": { schema: ErrorResponse } }, description: "La identidad ya está vinculada" } } });

registry.registerPath({ method: "get", path: "/progreso/mi", operationId: "getMyProgress", tags: ["progreso"],
  summary: "Mi progreso", description: "Temas iniciados/completados y progreso de actividades",
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.object({ progresos_tema: z.array(ProgresoTema), progresos_actividad: z.array(ProgresoActividad) }) }) } }, description: "Progreso del usuario" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" } } });

registry.registerPath({ method: "post", path: "/progreso/eventos", operationId: "postProgressEvent", tags: ["progreso"],
  summary: "Enviar evento de progreso", description: "Evento idempotente (clientEventId unico). No duplica XP si ya existe.",
  request: { body: { content: { "application/json": { schema: ProgressEventBody } }, required: true } },
  responses: { 201: { content: { "application/json": { schema: ProgressEventCreatedResponse } }, description: "Evento nuevo registrado" }, 200: { content: { "application/json": { schema: ProgressEventDuplicateResponse } }, description: "Evento duplicado (ya procesado)" } } });

registry.registerPath({ method: "get", path: "/clubes", operationId: "listClubs", tags: ["clubes"],
  summary: "Listar clubes", description: "Clubes públicos disponibles sin exponer códigos de invitación",
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.array(ClubPublicoSchema) }) } }, description: "Lista de clubes" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" } } });

registry.registerPath({ method: "get", path: "/clubes/mios", operationId: "getMyClubs", tags: ["clubes"],
  summary: "Mis clubs", description: "Clubs del usuario autenticado",
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.array(ClubSchema) }) } }, description: "Mis clubs" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" } } });

registry.registerPath({ method: "get", path: "/gamificacion/mi", operationId: "getMyGamification", tags: ["gamificacion"],
  summary: "Mi estado de gamificacion", description: "Nivel, XP total, logros e insignias del usuario",
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.object({ nivel: NivelUsuario, logros: z.array(LogroUsuario) }) }) } }, description: "Estado de gamificacion" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" } } });

registry.registerPath({ method: "post", path: "/gamificacion/logros/{logro_id}/reclamar", operationId: "claimAchievement", tags: ["gamificacion"],
  summary: "Reclamar logro", description: "Marca un logro pendiente como reclamado y otorga su bono XP una sola vez.",
  request: { params: z.object({ logro_id: z.string().uuid() }) },
  responses: {
    200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.object({ reclamado: z.literal(true), bono_xp: z.number(), nombre: z.string() }) }) } }, description: "Logro reclamado" },
    401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" },
    404: { content: { "application/json": { schema: ErrorResponse } }, description: "Logro no encontrado" },
  },
});

// ─── Auth paths ──────────────────────────────────────────────────────

registry.registerPath({ method: "post", path: "/autenticacion/configuracion-dev", operationId: "authDevSetup", tags: ["auth"],
  summary: "Crear admin de desarrollo", description: "Crea un usuario administrador. Solo disponible en entorno development.",
  responses: { 201: { content: { "application/json": { schema: AuthDevResponse } }, description: "Admin de desarrollo creado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No disponible fuera de desarrollo" } } });

// ─── Actividades paths ───────────────────────────────────────────────

registry.registerPath({ method: "get", path: "/actividades", operationId: "listActivities", tags: ["actividades"],
  summary: "Listar todas las actividades", description: "Todas las actividades disponibles, sin filtro",
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.array(ActividadSchema) }) } }, description: "Lista de actividades" } } });

registry.registerPath({ method: "post", path: "/actividades/{actividad_id}/responder", operationId: "respondActivity", tags: ["actividades"],
  summary: "Responder actividad", description: "Registra la respuesta del usuario a una actividad. Es idempotente via evento_id_cliente.",
  request: { params: z.object({ actividad_id: z.string().uuid() }), body: { content: { "application/json": { schema: ResponderActividadBody } }, required: true } },
  responses: { 201: { content: { "application/json": { schema: ResponderActividadResponse } }, description: "Respuesta registrada" }, 200: { content: { "application/json": { schema: ResponderActividadResponse } }, description: "Evento ya procesado o recompensa ya otorgada" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "Actividad u opcion no encontrada" } } });

// ─── Administracion paths ────────────────────────────────────────────

registry.registerPath({ method: "get", path: "/administracion/resumen", operationId: "adminResumen", tags: ["administracion"],
  summary: "Resumen de administracion", description: "Conteo de temas, publicados, usuarios y actividades",
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: AdminResumen }) } }, description: "Resumen" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" } } });

registry.registerPath({ method: "get", path: "/administracion/temas", operationId: "adminListThemes", tags: ["administracion"],
  summary: "Listar temas (admin)", description: "Lista todos los temas. Filtrable por estado (?status=borrador|publicado|archivado)",
  request: { query: z.object({ status: z.string().optional().openapi({ description: "Filtrar por estado", example: "publicado" }) }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.array(TemaResumido) }) } }, description: "Lista de temas" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" } } });

registry.registerPath({ method: "get", path: "/administracion/temas/{tema_id}", operationId: "adminGetTheme", tags: ["administracion"],
  summary: "Obtener tema (admin)", description: "Obtiene un tema por ID con datos administrativos",
  request: { params: z.object({ tema_id: z.string().uuid() }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: TemaResumido }) } }, description: "Tema encontrado" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrado" } } });

registry.registerPath({ method: "post", path: "/administracion/temas", operationId: "adminCreateTheme", tags: ["administracion"],
  summary: "Crear tema", description: "Crea un nuevo tema en estado borrador",
  request: { body: { content: { "application/json": { schema: AdminCreateThemeBody } }, required: true } },
  responses: { 201: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: TemaResumido }) } }, description: "Tema creado" }, 400: { content: { "application/json": { schema: ErrorResponse } }, description: "Datos invalidos" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" } } });

registry.registerPath({ method: "patch", path: "/administracion/temas/{tema_id}", operationId: "adminUpdateTheme", tags: ["administracion"],
  summary: "Actualizar tema", description: "Actualiza los campos de un tema existente",
  request: { params: z.object({ tema_id: z.string().uuid() }), body: { content: { "application/json": { schema: AdminUpdateThemeBody } }, required: true } },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: TemaResumido }) } }, description: "Tema actualizado" }, 400: { content: { "application/json": { schema: ErrorResponse } }, description: "Datos invalidos" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrado" } } });

registry.registerPath({ method: "delete", path: "/administracion/temas/{tema_id}", operationId: "adminDeleteTheme", tags: ["administracion"],
  summary: "Eliminar tema", description: "Elimina un tema permanentemente",
  request: { params: z.object({ tema_id: z.string().uuid() }) },
  responses: { 200: { content: { "application/json": { schema: DeletedResponse } }, description: "Tema eliminado" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrado" } } });

registry.registerPath({ method: "post", path: "/administracion/temas/{tema_id}/pasos", operationId: "adminUpsertStep", tags: ["administracion"],
  summary: "Crear o actualizar paso CRECER", description: "Crea o actualiza un paso del tema y su contenido. Usa upsert por tema_id + tipo_paso_id.",
  request: { params: z.object({ tema_id: z.string().uuid() }), body: { content: { "application/json": { schema: AdminUpsertStepBody } }, required: true } },
  responses: { 200: { content: { "application/json": { schema: AdminStepWithContentResponse } }, description: "Paso creado o actualizado" }, 400: { content: { "application/json": { schema: ErrorResponse } }, description: "Datos invalidos" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" } } });

registry.registerPath({ method: "get", path: "/administracion/temas/{tema_id}/pasos", operationId: "adminListSteps", tags: ["administracion"],
  summary: "Listar pasos CRECER de un tema", description: "Todos los pasos del tema con sus contenidos",
  request: { params: z.object({ tema_id: z.string().uuid() }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.array(PasoTemaCrecerSchema) }) } }, description: "Pasos del tema" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" } } });

registry.registerPath({ method: "delete", path: "/administracion/temas/{tema_id}/pasos/{tipo_paso_id}", operationId: "adminDeleteStep", tags: ["administracion"],
  summary: "Eliminar paso CRECER", description: "Elimina un paso del tema y su contenido asociado",
  request: { params: z.object({ tema_id: z.string().uuid(), tipo_paso_id: z.string().uuid() }) },
  responses: { 200: { content: { "application/json": { schema: DeletedResponse } }, description: "Paso eliminado" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrado" } } });

registry.registerPath({ method: "post", path: "/administracion/temas/{tema_id}/publicar", operationId: "adminPublishTheme", tags: ["administracion"],
  summary: "Publicar tema", description: "Cambia el estado a publicado, incrementa version de contenido",
  request: { params: z.object({ tema_id: z.string().uuid() }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: TemaResumido }) } }, description: "Tema publicado" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrado" } } });

registry.registerPath({ method: "post", path: "/administracion/temas/{tema_id}/borrador", operationId: "adminDraftTheme", tags: ["administracion"],
  summary: "Volver a borrador", description: "Cambia el estado del tema a borrador",
  request: { params: z.object({ tema_id: z.string().uuid() }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: TemaResumido }) } }, description: "Tema en borrador" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrado" } } });

registry.registerPath({ method: "get", path: "/administracion/actividades", operationId: "adminListActivities", tags: ["administracion"],
  summary: "Listar actividades administrativas", description: "Lista actividades con sus opciones privadas, incluidas las respuestas correctas. Solo administradores.",
  request: { query: z.object({ tema_id: z.string().uuid().optional(), tipo_actividad_id: z.string().uuid().optional(), grupo_edad_id: z.string().uuid().optional(), estado: z.string().optional(), limit: z.number().int().min(1).max(500).optional(), offset: z.number().int().min(0).optional() }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.object({ actividades: z.array(AdminActivityItem), total: z.number().int().nonnegative() }) }) } }, description: "Actividades administrativas" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" } } });

registry.registerPath({ method: "get", path: "/administracion/actividades/{actividad_id}", operationId: "adminGetActivity", tags: ["administracion"],
  summary: "Obtener actividad administrativa", description: "Obtiene una actividad con sus opciones privadas y respuestas correctas. Solo administradores.",
  request: { params: z.object({ actividad_id: z.string().uuid() }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: AdminActivityItem }) } }, description: "Actividad administrativa" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrada" } } });

registry.registerPath({ method: "post", path: "/administracion/actividades", operationId: "adminCreateActivity", tags: ["administracion"],
  summary: "Crear actividad", description: "Crea una nueva actividad con opciones de respuesta",
  request: { body: { content: { "application/json": { schema: AdminCreateActivityBody } }, required: true } },
  responses: { 201: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: ActividadSchema }) } }, description: "Actividad creada" }, 400: { content: { "application/json": { schema: ErrorResponse } }, description: "Datos invalidos" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" } } });

registry.registerPath({ method: "patch", path: "/administracion/actividades/{actividad_id}", operationId: "adminUpdateActivity", tags: ["administracion"],
  summary: "Actualizar actividad", description: "Actualiza campos de una actividad existente",
  request: { params: z.object({ actividad_id: z.string().uuid() }), body: { content: { "application/json": { schema: AdminUpdateActivityBody } }, required: true } },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: ActividadSchema }) } }, description: "Actividad actualizada" }, 400: { content: { "application/json": { schema: ErrorResponse } }, description: "Datos invalidos" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrada" } } });

registry.registerPath({ method: "delete", path: "/administracion/actividades/{actividad_id}", operationId: "adminDeleteActivity", tags: ["administracion"],
  summary: "Eliminar actividad", description: "Elimina una actividad, sus opciones y progreso asociado",
  request: { params: z.object({ actividad_id: z.string().uuid() }) },
  responses: { 200: { content: { "application/json": { schema: DeletedResponse } }, description: "Actividad eliminada" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrada" } } });

// ─── Admin usuarios paths ──────────────────────────────────────────────

registry.registerPath({ method: "get", path: "/administracion/usuarios", operationId: "adminListUsers", tags: ["administracion"],
  summary: "Listar usuarios", description: "Lista todos los usuarios. Paginable y filtrable por busqueda (?q=) y rol (?rol=).",
  request: { query: z.object({ q: z.string().optional().openapi({ description: "Buscar por nombre o correo", example: "Aventurero" }), rol: z.string().optional().openapi({ description: "Filtrar por rol", example: "usuario" }), limit: z.number().int().min(1).max(100).optional().openapi({ description: "Maximo de resultados", example: 20 }), offset: z.number().int().min(0).optional().openapi({ description: "Desplazamiento", example: 0 }) }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.object({ usuarios: z.array(AdminUserItem), total: z.number().openapi({ description: "Total de usuarios sin paginacion" }) }) }) } }, description: "Lista de usuarios" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" } } });

registry.registerPath({ method: "get", path: "/administracion/usuarios/{usuario_id}", operationId: "adminGetUser", tags: ["administracion"],
  summary: "Obtener usuario", description: "Detalle completo de un usuario con su perfil anidado",
  request: { params: z.object({ usuario_id: z.string().uuid().openapi({ description: "ID del usuario", example: uuidExample }) }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.unknown() }) } }, description: "Usuario encontrado" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrado" } } });

registry.registerPath({ method: "patch", path: "/administracion/usuarios/{usuario_id}", operationId: "adminUpdateUser", tags: ["administracion"],
  summary: "Actualizar usuario", description: "Actualiza el rol o nombre visible de un usuario",
  request: { params: z.object({ usuario_id: z.string().uuid().openapi({ description: "ID del usuario", example: uuidExample }) }), body: { content: { "application/json": { schema: AdminUpdateUserBody } }, required: true } },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.unknown() }) } }, description: "Usuario actualizado" }, 400: { content: { "application/json": { schema: ErrorResponse } }, description: "Datos invalidos" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrado" } } });

registry.registerPath({ method: "delete", path: "/administracion/usuarios/{usuario_id}", operationId: "adminDeleteUser", tags: ["administracion"],
  summary: "Desactivar usuario", description: "Desactiva un usuario (borrado logico, campo activo=false)",
  request: { params: z.object({ usuario_id: z.string().uuid().openapi({ description: "ID del usuario", example: uuidExample }) }) },
  responses: { 200: { content: { "application/json": { schema: AdminUserDeletedResponse } }, description: "Usuario desactivado" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrado" } } });

// ─── Clubes paths ─────────────────────────────────────────────────────

registry.registerPath({ method: "get", path: "/clubes/{clubId}", operationId: "getClub", tags: ["clubes"],
  summary: "Obtener club", description: "Detalle del club con miembros e info del creador",
  request: { params: z.object({ clubId: z.string().uuid() }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: ClubDetallado }) } }, description: "Club encontrado" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "Debes pertenecer al club" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrado" } } });

registry.registerPath({ method: "post", path: "/clubes", operationId: "createClub", tags: ["clubes"],
  summary: "Crear club", description: "Crea un nuevo club. El creador se convierte en lider automaticamente.",
  request: { body: { content: { "application/json": { schema: CreateClubBody } }, required: true } },
  responses: { 201: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: ClubSchema }) } }, description: "Club creado" }, 400: { content: { "application/json": { schema: ErrorResponse } }, description: "Datos invalidos" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" } } });

registry.registerPath({ method: "post", path: "/clubes/unirse", operationId: "joinClubByCode", tags: ["clubes"],
  summary: "Unirse por código", description: "Busca un club por su código de acceso y une al usuario autenticado.",
  request: { body: { content: { "application/json": { schema: JoinClubBody } }, required: true } },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.object({ unido: z.boolean(), ya_era_miembro: z.boolean(), club: ClubSchema }) }) } }, description: "Membresía resuelta" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "Código inválido" } } });

registry.registerPath({ method: "post", path: "/clubes/{clubId}/unirse", operationId: "joinClub", tags: ["clubes"],
  summary: "Unirse a club", description: "Unete a un club usando el codigo de invitacion",
  request: { params: z.object({ clubId: z.string().uuid() }), body: { content: { "application/json": { schema: JoinClubBody } }, required: true } },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.object({ unido: z.boolean(), ya_era_miembro: z.boolean(), club: ClubSchema }) }) } }, description: "Membresía resuelta" }, 400: { content: { "application/json": { schema: ErrorResponse } }, description: "Ya eres miembro o datos invalidos" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "Codigo incorrecto o club inactivo" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "Club no encontrado" } } });

registry.registerPath({ method: "post", path: "/clubes/{clubId}/salir", operationId: "leaveClub", tags: ["clubes"],
  summary: "Salir de club", description: "Abandona un club. Si eres lider, debes transferir liderazgo antes.",
  request: { params: z.object({ clubId: z.string().uuid() }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.object({ left: z.literal(true) }) }) } }, description: "Saliste del club" }, 400: { content: { "application/json": { schema: ErrorResponse } }, description: "Transfiere liderazgo antes de salir" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No eres miembro o club no encontrado" } } });

registry.registerPath({ method: "get", path: "/clubes/{clubId}/ranking", operationId: "getClubRanking", tags: ["clubes"],
  summary: "Ranking del club", description: "Clasificacion de miembros del club por XP",
  request: { params: z.object({ clubId: z.string().uuid() }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.array(ClubRankingEntry) }) } }, description: "Ranking del club" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "Debes pertenecer al club" } } });

registry.registerPath({ method: "get", path: "/clubes/{clubId}/retos", operationId: "listClubChallenges", tags: ["clubes"],
  summary: "Retos del club", description: "Retos cooperativos del club",
  request: { params: z.object({ clubId: z.string().uuid() }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.array(RetoClub) }) } }, description: "Retos del club" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "Debes pertenecer al club" } } });

registry.registerPath({ method: "post", path: "/clubes/{clubId}/retos", operationId: "createClubChallenge", tags: ["clubes"],
  summary: "Crear reto", description: "Crea un reto cooperativo. Solo el lider del club puede crear retos.",
  request: { params: z.object({ clubId: z.string().uuid() }), body: { content: { "application/json": { schema: CreateRetoBody } }, required: true } },
  responses: { 201: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: RetoClub }) } }, description: "Reto creado" }, 400: { content: { "application/json": { schema: ErrorResponse } }, description: "Datos invalidos" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "Solo el lider puede crear retos" } } });

registry.registerPath({ method: "post", path: "/clubes/{clubId}/reportes", operationId: "createClubReport", tags: ["clubes"],
  summary: "Reportar miembro", description: "Reporta una conducta dentro de un club activo sin habilitar chat libre.",
  request: { params: z.object({ clubId: z.string().uuid() }), body: { content: { "application/json": { schema: CrearReporteClubBody } }, required: true } },
  responses: { 201: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.object({ id: z.string().uuid() }) }) } }, description: "Reporte creado" }, 400: { content: { "application/json": { schema: ErrorResponse } }, description: "Reporte inválido" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "Sin pertenencia al club" }, 429: { content: { "application/json": { schema: ErrorResponse } }, description: "Límite de reportes excedido" } } });

registry.registerPath({ method: "get", path: "/administracion/reportes-clubes", operationId: "adminListClubReports", tags: ["administracion"],
  summary: "Listar reportes de clubes", request: { query: z.object({ estado: z.enum(["abierto", "en_revision", "resuelto", "descartado"]).optional() }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.array(ReporteClubSchema) }) } }, description: "Reportes" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "Solo administradores" } } });

registry.registerPath({ method: "patch", path: "/administracion/reportes-clubes/{reporteId}", operationId: "adminResolveClubReport", tags: ["administracion"],
  summary: "Resolver reporte de club", request: { params: z.object({ reporteId: z.string().uuid() }), body: { content: { "application/json": { schema: ResolverReporteClubBody } }, required: true } },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: ReporteClubSchema }) } }, description: "Reporte actualizado" }, 409: { content: { "application/json": { schema: ErrorResponse } }, description: "Transición no permitida" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "Solo administradores" } } });

// ─── Media schemas ────────────────────────────────────────────────────

const MediaUploadBody = z.object({
  archivo: z.unknown().openapi({ description: "Archivo binario" }),
  tipo: z.enum(["imagen", "audio", "video", "documento"]).openapi({ description: "Tipo de recurso multimedia", example: "imagen" }),
  titulo: z.string().min(2).max(120).optional().openapi({ description: "Titulo editorial", example: "Portada del Buen Pastor" }),
  texto_alternativo: z.string().max(300).optional().openapi({ description: "Texto alternativo para accesibilidad", example: "Ilustracion de la creacion" }),
  ancho_px: z.number().int().positive().optional(),
  alto_px: z.number().int().positive().optional(),
  duracion_seg: z.number().int().nonnegative().optional()
}).openapi("MediaUploadBody");

const MediaUpdateBody = z.object({
  titulo: z.string().min(2).max(120).optional(),
  textoAlternativo: z.string().max(300).nullable().optional()
}).openapi("MediaUpdateBody");

const MediaUsageSchema = z.object({
  tipo: z.enum(["tema", "senda", "paso", "actividad"]),
  entidad_id: z.string().uuid(),
  titulo: z.string(),
  contexto: z.string(),
  tema_id: z.string().uuid().nullable(),
  href: z.string()
}).openapi("MediaUsage");

const MediaDetailSchema = RecursoMultimediaSchema.extend({
  uso_total: z.number().int().nonnegative(),
  puede_eliminar: z.boolean(),
  usos: z.array(MediaUsageSchema),
  subido_por_usuario: z.object({
    id: z.string().uuid(),
    nombre_visible: z.string(),
    correo: z.string().nullable()
  }).nullable()
}).openapi("MediaDetail");

const MediaUploadResponse = z.object({
  exito: z.literal(true),
  datos: RecursoMultimediaSchema
}).openapi("MediaUploadResponse");

registry.register("MediaUploadBody", MediaUploadBody);
registry.register("MediaUpdateBody", MediaUpdateBody);
registry.register("MediaUsage", MediaUsageSchema);
registry.register("MediaDetail", MediaDetailSchema);
registry.register("MediaUploadResponse", MediaUploadResponse);

registry.registerPath({ method: "post", path: "/media/subir", operationId: "uploadMedia", tags: ["media"],
  summary: "Subir archivo multimedia", description: "Sube una imagen, audio o video a Supabase Storage y crea un registro en recurso_multimedia.",
  request: { body: { content: { "multipart/form-data": { schema: MediaUploadBody } }, required: true } },
  responses: { 201: { content: { "application/json": { schema: MediaUploadResponse } }, description: "Recurso creado" }, 400: { content: { "application/json": { schema: ErrorResponse } }, description: "Datos invalidos o archivo muy grande" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 500: { content: { "application/json": { schema: ErrorResponse } }, description: "Error interno" } } });

registry.registerPath({ method: "get", path: "/media", operationId: "listMedia", tags: ["media"],
  summary: "Listar recursos multimedia", description: "Lista recursos activos con URL temporal y conteo real de usos.",
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.array(RecursoMultimediaSchema.extend({ uso_total: z.number().int().nonnegative() })) }) } }, description: "Biblioteca multimedia" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "No autorizado" } } });

registry.registerPath({ method: "get", path: "/media/{id}", operationId: "getMedia", tags: ["media"],
  summary: "Obtener recurso multimedia", description: "Obtiene metadatos, creador y referencias de uso del recurso.",
  request: { params: z.object({ id: z.string().uuid().openapi({ description: "ID del recurso", example: uuidExample }) }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: MediaDetailSchema }) } }, description: "Recurso encontrado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrado" } } });

registry.registerPath({ method: "patch", path: "/media/{id}", operationId: "updateMedia", tags: ["media"],
  summary: "Editar metadatos", description: "Actualiza titulo y texto alternativo sin cambiar el archivo.",
  request: { params: z.object({ id: z.string().uuid() }), body: { content: { "application/json": { schema: MediaUpdateBody } }, required: true } },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: RecursoMultimediaSchema }) } }, description: "Recurso actualizado" }, 400: { content: { "application/json": { schema: ErrorResponse } }, description: "Datos invalidos" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrado" } } });

registry.registerPath({ method: "post", path: "/media/{id}/reemplazar", operationId: "replaceMedia", tags: ["media"],
  summary: "Reemplazar archivo", description: "Cambia el objeto almacenado conservando el mismo ID y todas sus referencias.",
  request: { params: z.object({ id: z.string().uuid() }), body: { content: { "multipart/form-data": { schema: MediaUploadBody.omit({ tipo: true }) } }, required: true } },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: RecursoMultimediaSchema }) } }, description: "Archivo reemplazado" }, 400: { content: { "application/json": { schema: ErrorResponse } }, description: "Archivo incompatible" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrado" } } });

registry.registerPath({ method: "delete", path: "/media/{id}", operationId: "deleteMedia", tags: ["media"],
  summary: "Eliminar recurso multimedia", description: "Elimina el archivo y desactiva el registro solo cuando no tiene referencias.",
  request: { params: z.object({ id: z.string().uuid().openapi({ description: "ID del recurso", example: uuidExample }) }) },
  responses: { 200: { content: { "application/json": { schema: z.object({ exito: z.literal(true), datos: z.object({ deleted: z.literal(true) }) }) } }, description: "Recurso eliminado" }, 409: { content: { "application/json": { schema: ErrorResponse } }, description: "Recurso en uso" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 404: { content: { "application/json": { schema: ErrorResponse } }, description: "No encontrado" } } });

// ─── Sync schemas ──────────────────────────────────────────────────────

const SyncPullQuery = z.object({
  since: z.string().datetime().optional().openapi({ description: "Solo eventos desde esta fecha (ISO8601)", example: "2026-01-01T00:00:00.000Z" })
}).openapi("SyncPullQuery");

const SyncPushEventSchema = z.object({
  evento_id_cliente: z.string().uuid().openapi({ description: "ID unico del cliente (idempotencia)", example: uuidExample }),
  tipo_evento: z.enum(["tema_iniciado","tema_completado","bloque_iniciado","bloque_completado","actividad_iniciada","actividad_respondida","actividad_completada","recompensa_reclamada","tema_descargado","marcador_sincronizacion"])
    .openapi({ description: "Tipo de evento", example: "actividad_respondida" }),
  tema_id: z.string().uuid().optional(),
  paso_id: z.string().uuid().optional(),
  actividad_id: z.string().uuid().optional(),
  correcta: z.boolean().optional().openapi({ description: "Dato informativo del cliente; el servidor lo ignora para validar respuestas" }),
  puntaje: z.number().min(0).max(100).optional().openapi({ description: "Dato informativo del cliente; el servidor no lo usa como autoridad" }),
  xp_otorgada: z.number().int().min(0).optional().default(0).openapi({ description: "Valor no confiable: el servidor lo ignora y calcula las recompensas", example: 0 }),
  datos: z.object({}).passthrough().optional(),
  creado_en_cliente: z.string().datetime().optional().openapi({ example: "2026-01-01T00:00:00.000Z" }),
  dispositivo_id: z.string().optional()
}).openapi("SyncPushEvent");

const SyncPushBody = z.object({
  eventos: z.array(SyncPushEventSchema).min(1).max(100).openapi({ description: "Eventos offline a sincronizar" })
}).openapi("SyncPushBody");

const SyncPullResponse = z.object({
  exito: z.literal(true),
  datos: z.object({
    eventos: z.array(z.unknown()).openapi({ description: "Eventos de progreso del usuario" }),
    progreso: z.object({
      temas: z.array(z.unknown()).openapi({ description: "Progreso por tema" }),
      actividades: z.array(z.unknown()).openapi({ description: "Progreso por actividad" })
    })
  })
}).openapi("SyncPullResponse");

const SyncPushResponse = z.object({
  exito: z.literal(true),
  datos: z.object({
    procesados: z.number().openapi({ description: "Eventos procesados exitosamente", example: 5 }),
    omitidos: z.number().openapi({ description: "Eventos omitidos (duplicados)", example: 2 }),
    procesados_ids: z.array(z.string().uuid()),
    omitidos_ids: z.array(z.string().uuid()),
    logros_desbloqueados: z.array(LogroDesbloqueadoSchema),
    errores: z.array(z.object({
      evento_id_cliente: z.string().openapi({ example: uuidExample }),
      error: z.string().openapi({ example: "Error de base de datos" })
    })).openapi({ description: "Errores por evento" })
  })
}).openapi("SyncPushResponse");

registry.register("SyncPullQuery", SyncPullQuery);
registry.register("SyncPushEvent", SyncPushEventSchema);
registry.register("SyncPushBody", SyncPushBody);
registry.register("SyncPullResponse", SyncPullResponse);
registry.register("SyncPushResponse", SyncPushResponse);

registry.registerPath({ method: "get", path: "/sync/pull", operationId: "syncPull", tags: ["sync"],
  summary: "Sincronizar pull", description: "Trae eventos de progreso y estado actual desde una fecha. Usado para actualizar el estado local despues de reconexion.",
  request: { query: SyncPullQuery },
  responses: { 200: { content: { "application/json": { schema: SyncPullResponse } }, description: "Datos de sincronizacion" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" } } });

registry.registerPath({ method: "post", path: "/sync/push", operationId: "syncPush", tags: ["sync"],
  summary: "Sincronizar push", description: "Envia telemetria offline acumulada. Cada evento es idempotente por evento_id_cliente. Los campos de respuesta, puntaje y XP enviados por el cliente no son autoridad y se ignoran.",
  request: { body: { content: { "application/json": { schema: SyncPushBody } }, required: true } },
  responses: { 200: { content: { "application/json": { schema: SyncPushResponse } }, description: "Resultado de sincronizacion" }, 400: { content: { "application/json": { schema: ErrorResponse } }, description: "Datos invalidos" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" } } });

// ─── Generator ─────────────────────────────────────────────────────────

// Estas rutas ya existen en Hono; se registran con un envelope genérico
// mientras cada respuesta específica se documenta por módulo.
const rutasRuntimeSinContratoEspecífico = [
  ["delete", "/administracion/clubes/{clubId}/miembros/{usuarioId}"], ["delete", "/clubes/{clubId}"], ["delete", "/clubes/{clubId}/miembros/{miembroToken}"],
  ["get", "/administracion/ajustes"], ["get", "/administracion/clubes"], ["get", "/administracion/clubes/{clubId}"], ["get", "/administracion/logros"], ["get", "/administracion/logros/catalogo"], ["get", "/administracion/logros/{logroId}"], ["get", "/administracion/reportes"], ["get", "/administracion/resumen/detallado"], ["get", "/administracion/revisiones"], ["get", "/administracion/revisiones/{revision_id}"], ["get", "/administracion/sendas"], ["get", "/administracion/sendas/{id}"], ["get", "/administracion/temas-listado"], ["get", "/administracion/temas/{tema_id}/estudio"], ["get", "/media/{id}/url"], ["get", "/temas/{tema_id}/portada"],
  ["patch", "/administracion/ajustes"], ["patch", "/administracion/ajustes-plataforma"], ["patch", "/administracion/clubes/{clubId}"], ["patch", "/administracion/logros/{logroId}"], ["patch", "/administracion/sendas/{id}"], ["patch", "/clubes/{clubId}"],
  ["post", "/administracion/actividades/{actividad_id}/duplicar"], ["post", "/administracion/clubes"], ["post", "/administracion/clubes/{clubId}/archivar"], ["post", "/administracion/clubes/{clubId}/miembros"], ["post", "/administracion/clubes/{clubId}/reactivar"], ["post", "/administracion/clubes/{clubId}/regenerar-codigo"], ["post", "/administracion/clubes/{clubId}/retos"], ["post", "/administracion/clubes/{clubId}/retos/{retoId}/cerrar"], ["post", "/administracion/clubes/{clubId}/transferir-liderazgo"], ["post", "/administracion/logros"], ["post", "/administracion/logros/{logroId}/archivar"], ["post", "/administracion/logros/{logroId}/reactivar"], ["post", "/administracion/revisiones/{revision_id}/resolver"], ["post", "/administracion/sendas"], ["post", "/administracion/temas/{tema_id}/actividades/reordenar"], ["post", "/administracion/temas/{tema_id}/archivar"], ["post", "/administracion/temas/{tema_id}/duplicar"], ["post", "/administracion/temas/{tema_id}/enviar-revision"], ["post", "/administracion/temas/{tema_id}/resolver-revision"], ["post", "/administracion/usuarios/acciones"], ["post", "/administracion/usuarios/cuenta"], ["post", "/administracion/usuarios/invitar"], ["post", "/administracion/usuarios/menores"], ["post", "/clubes/{clubId}/regenerar-codigo"], ["post", "/clubes/{clubId}/retos/{retoId}/reclamar"], ["post", "/clubes/{clubId}/transferir-liderazgo"], ["post", "/gamificacion/logros/{logroId}/reclamar"],
] as const;

const GenericEnvelope = z.object({
  exito: z.boolean(), datos: z.unknown().optional(), error: z.string().optional(), codigo: z.string().optional(),
}).openapi("GenericEnvelope");

for (const [method, path] of rutasRuntimeSinContratoEspecífico) {
  const parametros = Object.fromEntries([...path.matchAll(/\{([^}]+)\}/g)].map(([, nombre]) => [nombre, z.string()]));
  registry.registerPath({
    method,
    path,
    operationId: `runtime_${method}_${path.replace(/[^a-zA-Z0-9]+/g, "_")}`,
    tags: [path.startsWith("/administracion") ? "administracion" : path.startsWith("/clubes") ? "clubes" : "media"],
    summary: `${method.toUpperCase()} ${path}`,
    description: "Ruta Hono registrada en el contrato; la respuesta específica se documentará por módulo.",
    ...(Object.keys(parametros).length > 0 ? { request: { params: z.object(parametros) } } : {}),
    responses: { 200: { content: { "application/json": { schema: GenericEnvelope } }, description: "Respuesta de la operación" }, 401: { content: { "application/json": { schema: ErrorResponse } }, description: "No autenticado" }, 403: { content: { "application/json": { schema: ErrorResponse } }, description: "Sin permisos" } },
  });
}

const generator = new OpenApiGeneratorV3(registry.definitions);

const generatedOpenApiSpec = generator.generateDocument({
  openapi: "3.1.0",
  info: {
    title: "Semillas",
    description: "API de Semillas - plataforma de ensenanza biblica para ninos, preadolescentes y adolescentes.",
    version: "0.1.0",
    contact: { name: "Semillas", url: "https://semillas.app" }
  },
  servers: [{ url: "http://localhost:8787", description: "Desarrollo local" }],
  tags: [
    { name: "system", description: "Estado y monitoreo del sistema" },
    { name: "auth", description: "Autenticacion y creacion de usuarios" },
    { name: "temas", description: "Temas biblicos y contenido" },
    { name: "catalogo", description: "Catalogos de referencia (grupos de edad, tipos, etc.)" },
    { name: "sendas", description: "Sendas de aprendizaje: Padre, Hijo y Espiritu Santo" },
    { name: "progreso", description: "Progreso del usuario y eventos" },
    { name: "actividades", description: "Actividades y ejercicios" },
    { name: "usuario", description: "Perfil y datos del usuario" },
    { name: "clubes", description: "Clubes y retos cooperativos" },
    { name: "gamificacion", description: "XP, niveles, insignias y rachas" },
    { name: "administracion", description: "Administracion de contenido y CMS" },
    { name: "media", description: "Recursos multimedia (imagenes, audio, video)" },
    { name: "sync", description: "Sincronizacion offline de eventos de progreso" }
  ]
  });

export const openApiSpec = {
  ...generatedOpenApiSpec,
  components: {
    ...(generatedOpenApiSpec.components ?? {}),
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT", description: "Token Supabase verificado por la API" },
      guestUserId: { type: "apiKey", in: "header", name: "X-Guest-User-Id", description: "UUID público de la sesión invitada" },
      guestToken: { type: "apiKey", in: "header", name: "X-Guest-Token", description: "Token de sesión invitada" },
    },
  },
};
