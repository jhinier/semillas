/**
 * ============================================================
 * ESQUEMA DE BASE DE DATOS - SEMILLAS
 * ============================================================
 * Este archivo define el esquema de Drizzle ORM para la base de
 * datos de Supabase. Se usa para:
 * - Queries tipadas con autocompletado
 * - Validación de tipos en tiempo de compilación
 * - Migraciones de base de datos
 *
 * Basado en el schema de Supabase (database.types.ts)
 *
 * @see https://orm.drizzle.team/docs/overview
 */

import {
  pgTable,
  varchar,
  text,
  uuid,
  timestamp,
  boolean,
  integer,
  jsonb,
  serial,
  real,
  pgEnum,
  uniqueIndex,
  primaryKey
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * ============================================================
 * ENUMS (Enumeraciones de PostgreSQL)
 * ============================================================
 * Representan valores fijos que no cambian en la base de datos.
 */

// Estados de publicación de contenido
export const estadoPublicacionEnum = pgEnum("estado_publicacion", [
  "borrador",
  "revision",
  "aprobado",
  "publicado",
  "archivado"
]);

// Estados del flujo de revisión de contenido
export const estadoRevisionContenidoEnum = pgEnum("estado_revision_contenido", [
  "borrador",
  "enviado",
  "cambios_solicitados",
  "aprobado",
  "publicado",
  "rechazado"
]);

// Proveedores de autenticación disponibles
export const proveedorAutenticacionEnum = pgEnum("proveedor_autenticacion", [
  "google",
  "facebook",
  "invitado",
  "correo"
]);

// Roles de usuario en el sistema
export const rolUsuarioEnum = pgEnum("rol_usuario", [
  "administrador",
  "usuario",
  "invitado",
  "padre"
]);

// Tipos de eventos de progreso que registran los usuarios
export const tipoEventoProgresoEnum = pgEnum("tipo_evento_progreso", [
  "tema_iniciado",
  "tema_completado",
  "bloque_iniciado",
  "bloque_completado",
  "actividad_iniciada",
  "actividad_respondida",
  "actividad_completada",
  "recompensa_reclamada",
  "tema_descargado",
  "marcador_sincronizacion"
]);

// Tipos de recursos multimedia soportados
export const tipoRecursoMultimediaEnum = pgEnum("tipo_recurso_multimedia", [
  "imagen",
  "audio",
  "video",
  "documento",
  "icono"
]);

/**
 * ============================================================
 * TABLAS DE USUARIOS Y AUTENTICACIÓN
 * ============================================================
 */

// Tabla principal de usuarios de la aplicación
export const usuarioApp = pgTable("usuario_app", {
  id: uuid("id").primaryKey().defaultRandom(),
  correo: varchar("correo", { length: 255 }),
  idExterno: varchar("id_externo", { length: 255 }),
  tokenInvitadoHash: varchar("token_invitado_hash", { length: 64 }),
  nombreVisible: varchar("nombre_visible", { length: 255 }).notNull(),
  proveedor: proveedorAutenticacionEnum("proveedor").notNull(),
  rol: rolUsuarioEnum("rol").notNull().default("invitado"),
  activo: boolean("activo").notNull().default(true),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
  actualizadoEn: timestamp("actualizado_en").notNull().defaultNow(),
  ultimoLoginEn: timestamp("ultimo_login_en")
});

// Perfil extendido de cada usuario (datos preferences)
export const perfil = pgTable("perfil", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id").notNull().references(() => usuarioApp.id, { onDelete: "cascade" }),
  apodo: varchar("apodo", { length: 100 }).notNull(),
  urlAvatar: varchar("url_avatar", { length: 500 }),
  claveAvatar: varchar("clave_avatar", { length: 255 }),
  grupoEdadId: uuid("grupo_edad_id"),
  prefiereAudio: boolean("prefiere_audio").notNull().default(false),
  tamanoTextoPreferido: varchar("tamano_texto_preferido", { length: 20 }).notNull().default("mediano"),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
  actualizadoEn: timestamp("actualizado_en").notNull().defaultNow()
});

// Relación tutor-menor para usuarios menores de edad
export const vinculoTutorMenor = pgTable("vinculo_tutor_menor", {
  id: uuid("id").primaryKey().defaultRandom(),
  menorId: uuid("menor_id").notNull().references(() => usuarioApp.id, { onDelete: "cascade" }),
  tutorId: uuid("tutor_id").notNull().references(() => usuarioApp.id, { onDelete: "cascade" }),
  relacion: varchar("relacion", { length: 50 }).notNull(),
  estado: varchar("estado", { length: 50 }).notNull().default("pendiente"),
  codigoInvitacion: varchar("codigo_invitacion", { length: 50 }),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
  aceptadoEn: timestamp("aceptado_en")
});

/**
 * ============================================================
 * TABLAS DE CONTENIDO BÍBLICO
 * ============================================================
 */

// Sendas espirituales (Padre, Hijo, Espíritu Santo)
export const senda = pgTable("senda", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  codigo: varchar("codigo", { length: 50 }).notNull().unique(),
  descripcion: text("descripcion"),
  colorHex: varchar("color_hex", { length: 7 }).notNull(),
  nombreIcono: varchar("nombre_icono", { length: 100 }),
  imagenRecursoId: uuid("imagen_recurso_id").references(() => recursoMultimedia.id, {
    onDelete: "set null"
  }),
  orden: integer("orden").notNull().default(0),
  activo: boolean("activo").notNull().default(true),
  creadoEn: timestamp("creado_en").notNull().defaultNow()
});

// Grupos de edad (Semillas 5-8, Exploradores 9-12, Embajadores 13-17)
export const grupoEdad = pgTable("grupo_edad", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  codigo: varchar("codigo", { length: 50 }).notNull().unique(),
  descripcion: text("descripcion"),
  edadMinima: integer("edad_minima").notNull(),
  edadMaxima: integer("edad_maxima").notNull(),
  orden: integer("orden").notNull().default(0),
  creadoEn: timestamp("creado_en").notNull().defaultNow()
});

// Temas bíblicos (lecciones principales)
export const tema = pgTable("tema", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  objetivo: text("objetivo").notNull(),
  resumen: text("resumen"),
  estado: estadoPublicacionEnum("estado").notNull().default("borrador"),
  xpRecompensa: integer("xp_recompensa").notNull().default(0),
  minutosEstimados: integer("minutos_estimados").notNull().default(30),
  versionContenido: integer("version_contenido").notNull().default(1),
  portadaRecursoId: uuid("portada_recurso_id"),
  versionBiblicaId: uuid("version_biblica_id"),
  sendaId: uuid("senda_id").notNull().references(() => senda.id),
  creadoPor: uuid("creado_por").references(() => usuarioApp.id),
  revisadoPor: uuid("revisado_por").references(() => usuarioApp.id),
  publicadoPor: uuid("publicado_por").references(() => usuarioApp.id),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
  actualizadoEn: timestamp("actualizado_en").notNull().defaultNow(),
  publicadoEn: timestamp("publicado_en"),
  revisadoEn: timestamp("revisado_en")
});

// Relación muchos a muchos entre temas y grupos de edad
export const temaGrupoEdad = pgTable("tema_grupo_edad", {
  temaId: uuid("tema_id").notNull().references(() => tema.id, { onDelete: "cascade" }),
  grupoEdadId: uuid("grupo_edad_id").notNull().references(() => grupoEdad.id, { onDelete: "cascade" })
});

// Pasos/tempos del método CRECER (Conectar, Relatar, Enseñar, etc.)
export const pasoTema = pgTable("paso_tema", {
  id: uuid("id").primaryKey().defaultRandom(),
  temaId: uuid("tema_id").notNull().references(() => tema.id, { onDelete: "cascade" }),
  tipoPasoId: uuid("tipo_paso_id").notNull().references(() => tipoPasoCrecer.id),
  orden: integer("orden").notNull(),
  obligatorio: boolean("obligatorio").notNull().default(true),
  creadoEn: timestamp("creado_en").notNull().defaultNow()
});

// Tipos de pasos del método CRECER
export const tipoPasoCrecer = pgTable("tipo_paso_crecer", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  codigo: varchar("codigo", { length: 50 }).notNull().unique(),
  descripcion: text("descripcion"),
  colorHex: varchar("color_hex", { length: 7 }),
  orden: integer("orden").notNull()
});

// Contenido de cada paso por grupo de edad
export const contenidoPasoTema = pgTable("contenido_paso_tema", {
  id: uuid("id").primaryKey().defaultRandom(),
  pasoId: uuid("paso_id").notNull().references(() => pasoTema.id, { onDelete: "cascade" }),
  grupoEdadId: uuid("grupo_edad_id").notNull().references(() => grupoEdad.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  cuerpo: text("cuerpo").notNull(),
  instruccionCorta: varchar("instruccion_corta", { length: 255 }),
  recursoId: uuid("recurso_id"),
  recursoAudioId: uuid("recurso_audio_id"),
  datosExtra: jsonb("datos_extra")
});

// Preguntas de reflexión por paso y grupo de edad
export const preguntaReflexion = pgTable("pregunta_reflexion", {
  id: uuid("id").primaryKey().defaultRandom(),
  pasoId: uuid("paso_id").notNull().references(() => pasoTema.id, { onDelete: "cascade" }),
  grupoEdadId: uuid("grupo_edad_id").notNull().references(() => grupoEdad.id),
  pregunta: text("pregunta").notNull(),
  orden: integer("orden").notNull()
});

// Versículos clave de cada tema
export const versiculoClave = pgTable("versiculo_clave", {
  id: uuid("id").primaryKey().defaultRandom(),
  temaId: uuid("tema_id").notNull().references(() => tema.id, { onDelete: "cascade" }),
  libroId: integer("libro_id").notNull().references(() => libroBiblico.id),
  capitulo: integer("capitulo").notNull(),
  versiculo: integer("versiculo").notNull(),
  texto: text("texto").notNull()
});

// Referencias bíblicas adicionales
export const referenciaBiblica = pgTable("referencia_biblica", {
  id: uuid("id").primaryKey().defaultRandom(),
  temaId: uuid("tema_id").notNull().references(() => tema.id, { onDelete: "cascade" }),
  libroId: integer("libro_id").notNull().references(() => libroBiblico.id),
  capitulo: integer("capitulo").notNull(),
  versiculoInicio: integer("versiculo_inicio").notNull(),
  versiculoFin: integer("versiculo_fin").notNull(),
  principal: boolean("principal").notNull().default(false)
});

// Libros bíblicos
export const libroBiblico = pgTable("libro_biblico", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  orden: integer("orden").notNull(),
  testamentoId: integer("testamento_id").notNull().references(() => testamentoBiblico.id)
});

// Testamentos bíblicos (Antiguo y Nuevo)
export const testamentoBiblico = pgTable("testamento_biblico", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 50 }).notNull(),
  codigo: varchar("codigo", { length: 20 }).notNull()
});

// Versiones bíblicas disponibles (NVI, RV, etc.)
export const versionBiblica = pgTable("version_biblica", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  codigo: varchar("codigo", { length: 20 }).notNull().unique(),
  dominioPublico: boolean("dominio_publico").notNull().default(true),
  creadoEn: timestamp("creado_en").notNull().defaultNow()
});

/**
 * ============================================================
 * TABLAS DE ACTIVIDADES Y RECURSOS
 * ============================================================
 */

// Tipos de actividades (quiz, flashcards, completar, etc.)
export const tipoActividad = pgTable("tipo_actividad", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  codigo: varchar("codigo", { length: 50 }).notNull().unique(),
  descripcion: text("descripcion"),
  esJuego: boolean("es_juego").notNull().default(false),
  activo: boolean("activo").notNull().default(true),
  creadoEn: timestamp("creado_en").notNull().defaultNow()
});

// Actividades individuales dentro de un tema
export const actividad = pgTable("actividad", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  consigna: text("consigna").notNull(),
  temaId: uuid("tema_id").notNull().references(() => tema.id, { onDelete: "cascade" }),
  pasoId: uuid("paso_id").references(() => pasoTema.id, { onDelete: "set null" }),
  tipoActividadId: uuid("tipo_actividad_id").notNull().references(() => tipoActividad.id),
  grupoEdadId: uuid("grupo_edad_id").notNull().references(() => grupoEdad.id),
  dificultad: varchar("dificultad", { length: 20 }).notNull().default("media"),
  xpRecompensa: integer("xp_recompensa").notNull().default(0),
  obligatorio: boolean("obligatorio").notNull().default(false),
  limiteTiempoSeg: integer("limite_tiempo_seg"),
  retroalimentacion: text("retroalimentacion"),
  configuracion: jsonb("configuracion"),
  orden: integer("orden").notNull(),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
  actualizadoEn: timestamp("actualizado_en").notNull().defaultNow()
});

// Opciones de respuesta de una actividad
export const opcionActividad = pgTable("opcion_actividad", {
  id: uuid("id").primaryKey().defaultRandom(),
  actividadId: uuid("actividad_id").notNull().references(() => actividad.id, { onDelete: "cascade" }),
  texto: text("texto").notNull(),
  correcta: boolean("correcta").notNull().default(false),
  etiqueta: varchar("etiqueta", { length: 50 }),
  retroalimentacion: text("retroalimentacion"),
  orden: integer("orden").notNull()
});

// Recursos multimedia (imágenes, audios, videos)
export const recursoMultimedia = pgTable("recurso_multimedia", {
  id: uuid("id").primaryKey().defaultRandom(),
  titulo: varchar("titulo", { length: 255 }),
  tipo: tipoRecursoMultimediaEnum("tipo").notNull(),
  urlPublica: text("url_publica").notNull(),
  bucketAlmacenamiento: varchar("bucket_almacenamiento", { length: 100 }),
  claveAlmacenamiento: varchar("clave_almacenamiento", { length: 255 }),
  tipoMime: varchar("tipo_mime", { length: 100 }),
  tamanoBytes: integer("tamano_bytes"),
  anchoPx: integer("ancho_px"),
  altoPx: integer("alto_px"),
  duracionSeg: integer("duracion_seg"),
  textoAlternativo: text("texto_alternativo"),
  activo: boolean("activo").notNull().default(true),
  creadoPor: uuid("creado_por").references(() => usuarioApp.id),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
  actualizadoEn: timestamp("actualizado_en").notNull().defaultNow()
});

/**
 * ============================================================
 * TABLAS DE PROGRESO Y GAMIFICACIÓN
 * ============================================================
 */

// Reglas de niveles (nombre, XP mínima, color insignia)
export const reglaNivel = pgTable("regla_nivel", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  numeroNivel: integer("numero_nivel").notNull().unique(),
  xpMinima: integer("xp_minima").notNull(),
  colorInsignia: varchar("color_insignia", { length: 7 })
});

// Logros/insignias que puede ganar un usuario
export const logro = pgTable("logro", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  codigo: varchar("codigo", { length: 50 }).notNull().unique(),
  descripcion: text("descripcion"),
  urlIcono: varchar("url_icono", { length: 500 }),
  bonoXp: integer("bono_xp").notNull().default(0),
  codigoCriterio: varchar("codigo_criterio", { length: 50 }).notNull(),
  valorCriterio: integer("valor_criterio"),
  activo: boolean("activo").notNull().default(true),
  creadoEn: timestamp("creado_en").notNull().defaultNow()
});

// Logros ganados por cada usuario
export const logroUsuario = pgTable("logro_usuario", {
  logroId: uuid("logro_id").notNull().references(() => logro.id, { onDelete: "cascade" }),
  usuarioId: uuid("usuario_id").notNull().references(() => usuarioApp.id, { onDelete: "cascade" }),
  ganadoEn: timestamp("ganado_en").notNull().defaultNow(),
  // null = desbloqueado pero pendiente de reclamar; not null = reclamado por el usuario
  reclamadoEn: timestamp("reclamado_en")
}, (t) => ({
  pk: primaryKey({ columns: [t.logroId, t.usuarioId] })
}));

// Progreso de un usuario en un tema específico
export const progresoTemaUsuario = pgTable("progreso_tema_usuario", {
  usuarioId: uuid("usuario_id").notNull().references(() => usuarioApp.id, { onDelete: "cascade" }),
  temaId: uuid("tema_id").notNull().references(() => tema.id, { onDelete: "cascade" }),
  estado: varchar("estado", { length: 50 }).notNull().default("no_iniciado"),
  porcentaje: integer("porcentaje").notNull().default(0),
  ultimoPasoId: uuid("ultimo_paso_id").references(() => pasoTema.id),
  iniciadoEn: timestamp("iniciado_en"),
  completadoEn: timestamp("completado_en"),
  actualizadoEn: timestamp("actualizado_en").notNull().defaultNow()
});

// Progreso de un usuario en una actividad específica
export const progresoActividadUsuario = pgTable("progreso_actividad_usuario", {
  usuarioId: uuid("usuario_id").notNull().references(() => usuarioApp.id, { onDelete: "cascade" }),
  actividadId: uuid("actividad_id").notNull().references(() => actividad.id, { onDelete: "cascade" }),
  intentos: integer("intentos").notNull().default(0),
  mejorPuntaje: integer("mejor_puntaje").notNull().default(0),
  completado: boolean("completado").notNull().default(false),
  completadoEn: timestamp("completado_en"),
  actualizadoEn: timestamp("actualizado_en").notNull().defaultNow()
});

// Eventos de progreso para sincronización offline
export const eventoProgreso = pgTable("evento_progreso", {
  id: uuid("id").primaryKey().defaultRandom(),
  idEventoCliente: uuid("id_evento_cliente").notNull(),
  usuarioId: uuid("usuario_id").notNull().references(() => usuarioApp.id, { onDelete: "cascade" }),
  tipoEvento: tipoEventoProgresoEnum("tipo_evento").notNull(),
  temaId: uuid("tema_id").references(() => tema.id, { onDelete: "set null" }),
  pasoId: uuid("paso_id").references(() => pasoTema.id, { onDelete: "set null" }),
  actividadId: uuid("actividad_id").references(() => actividad.id, { onDelete: "set null" }),
  datos: jsonb("datos"),
  puntaje: integer("puntaje"),
  correcta: boolean("correcta"),
  xpOtorgada: integer("xp_otorgada").notNull().default(0),
  dispositivoId: varchar("dispositivo_id", { length: 255 }),
  ocurridoEnCliente: timestamp("ocurrido_en_cliente").notNull(),
  recibidoEnServidor: timestamp("recibido_en_servidor").notNull().defaultNow()
}, (tabla) => [
  uniqueIndex("uq_evento_progreso_usuario_evento_cliente")
    .on(tabla.usuarioId, tabla.idEventoCliente),
  uniqueIndex("uq_evento_progreso_recompensa_actividad")
    .on(tabla.usuarioId, tabla.actividadId)
    .where(sql`${tabla.actividadId} is not null and ${tabla.xpOtorgada} > 0`)
]);

// Paquetes de contenido para descarga offline
export const paqueteSinConexion = pgTable("paquete_sin_conexion", {
  id: uuid("id").primaryKey().defaultRandom(),
  temaId: uuid("tema_id").notNull().references(() => tema.id, { onDelete: "cascade" }),
  versionContenido: integer("version_contenido").notNull(),
  tamanoBytes: integer("tamano_bytes").notNull(),
  manifiesto: jsonb("manifiesto"),
  creadoEn: timestamp("creado_en").notNull().defaultNow()
}, (tabla) => [
  uniqueIndex("uq_paquete_sin_conexion_tema_version").on(tabla.temaId, tabla.versionContenido)
]);

// Descargas offline por usuario
export const descargaSinConexionUsuario = pgTable("descarga_sin_conexion_usuario", {
  usuarioId: uuid("usuario_id").notNull().references(() => usuarioApp.id, { onDelete: "cascade" }),
  paqueteId: uuid("paquete_id").notNull().references(() => paqueteSinConexion.id, { onDelete: "cascade" }),
  descargadoEn: timestamp("descargado_en").notNull().defaultNow(),
  ultimoAbiertoEn: timestamp("ultimo_abierto_en")
}, (tabla) => [
  uniqueIndex("uq_descarga_sin_conexion_usuario_paquete").on(tabla.usuarioId, tabla.paqueteId)
]);

/**
 * ============================================================
 * TABLAS DE CLUBES Y SOCIAL
 * ============================================================
 */

// Clubes de usuarios
export const club = pgTable("club", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  descripcion: text("descripcion"),
  codigoInvitacion: varchar("codigo_invitacion", { length: 20 }).notNull().unique(),
  creadoPor: uuid("creado_por").notNull().references(() => usuarioApp.id),
  activo: boolean("activo").notNull().default(true),
  creadoEn: timestamp("creado_en").notNull().defaultNow()
});

// Miembros de un club
export const miembroClub = pgTable("miembro_club", {
  clubId: uuid("club_id").notNull().references(() => club.id, { onDelete: "cascade" }),
  usuarioId: uuid("usuario_id").notNull().references(() => usuarioApp.id, { onDelete: "cascade" }),
  tokenPublico: uuid("token_publico").notNull().defaultRandom(),
  rolMiembro: varchar("rol_miembro", { length: 50 }).notNull().default("miembro"),
  unidoEn: timestamp("unido_en").notNull().defaultNow()
});

// Retos cooperativos de los clubes
export const retoClub = pgTable("reto_club", {
  id: uuid("id").primaryKey().defaultRandom(),
  clubId: uuid("club_id").references(() => club.id, { onDelete: "set null" }),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  codigoMetrica: varchar("codigo_metrica", { length: 50 }).notNull(),
  valorObjetivo: integer("valor_objetivo").notNull(),
  xpReto: integer("xp_reto").notNull().default(0),
  fechaInicio: timestamp("fecha_inicio").notNull(),
  fechaFin: timestamp("fecha_fin").notNull(),
  creadoPor: uuid("creado_por").references(() => usuarioApp.id),
  creadoEn: timestamp("creado_en").notNull().defaultNow()
});

// Recompensas individuales reclamadas por completar un reto cooperativo
export const recompensaRetoClubUsuario = pgTable("recompensa_reto_club_usuario", {
  retoId: uuid("reto_id").notNull().references(() => retoClub.id, { onDelete: "cascade" }),
  usuarioId: uuid("usuario_id").notNull().references(() => usuarioApp.id, { onDelete: "cascade" }),
  xpOtorgada: integer("xp_otorgada").notNull().default(0),
  reclamadoEn: timestamp("reclamado_en").notNull().defaultNow()
}, (tabla) => [
  uniqueIndex("uq_recompensa_reto_club_usuario").on(tabla.retoId, tabla.usuarioId)
]);

// Tarjetas de logros compartidas por usuarios
export const tarjetaCompartida = pgTable("tarjeta_compartida", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id").notNull().references(() => usuarioApp.id, { onDelete: "cascade" }),
  temaId: uuid("tema_id").references(() => tema.id, { onDelete: "set null" }),
  logroId: uuid("logro_id").references(() => logro.id, { onDelete: "set null" }),
  urlImagen: text("url_imagen").notNull(),
  creadoEn: timestamp("creado_en").notNull().defaultNow()
});

export const reporteClub = pgTable("reporte_club", {
  id: uuid("id").primaryKey().defaultRandom(),
  clubId: uuid("club_id").notNull().references(() => club.id, { onDelete: "cascade" }),
  reportadoPor: uuid("reportado_por").notNull().references(() => usuarioApp.id, { onDelete: "cascade" }),
  reportadoUsuarioId: uuid("reportado_usuario_id").notNull().references(() => usuarioApp.id, { onDelete: "cascade" }),
  categoria: varchar("categoria", { length: 40 }).notNull(),
  detalle: varchar("detalle", { length: 500 }),
  estado: varchar("estado", { length: 30 }).notNull().default("abierto"),
  resueltoPor: uuid("resuelto_por").references(() => usuarioApp.id, { onDelete: "set null" }),
  notaResolucion: varchar("nota_resolucion", { length: 500 }),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
  actualizadoEn: timestamp("actualizado_en").notNull().defaultNow(),
});

/**
 * ============================================================
 * TABLAS DE ADMINISTRACIÓN Y AUDITORÍA
 * ============================================================
 */

// Registros de auditoría para cambios de administradores
export const registroAuditoria = pgTable("registro_auditoria", {
  id: uuid("id").primaryKey().defaultRandom(),
  tipoEntidad: varchar("tipo_entidad", { length: 100 }).notNull(),
  entidadId: uuid("entidad_id"),
  accion: varchar("accion", { length: 50 }).notNull(),
  datosAntes: jsonb("datos_antes"),
  datosDespues: jsonb("datos_despues"),
  actorUsuarioId: uuid("actor_usuario_id").references(() => usuarioApp.id),
  direccionIp: text("direccion_ip"),
  agenteUsuario: text("agente_usuario"),
  creadoEn: timestamp("creado_en").notNull().defaultNow()
});

// Configuración global clave/valor compartida por módulos administrativos.
export const configuracionPlataforma = pgTable("configuracion_plataforma", {
  clave: text("clave").primaryKey(),
  categoria: varchar("categoria", { length: 80 }).notNull(),
  valor: jsonb("valor").notNull(),
  descripcion: text("descripcion"),
  actualizadoPor: uuid("actualizado_por").references(() => usuarioApp.id, { onDelete: "set null" }),
  actualizadoEn: timestamp("actualizado_en").notNull().defaultNow()
});

// Revisiones de contenido antes de publicar
export const revisionContenido = pgTable("revision_contenido", {
  id: uuid("id").primaryKey().defaultRandom(),
  temaId: uuid("tema_id").notNull().references(() => tema.id, { onDelete: "cascade" }),
  estado: estadoRevisionContenidoEnum("estado").notNull().default("borrador"),
  notas: text("notas"),
  notasEnvio: text("notas_envio"),
  notasRevision: text("notas_revision"),
  enviadoPor: uuid("enviado_por").references(() => usuarioApp.id),
  revisadoPor: uuid("revisado_por").references(() => usuarioApp.id),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
  revisadoEn: timestamp("revisado_en")
});

/**
 * ============================================================
 * TIPOS EXPORTADOS PARA USO EN LA APLICACIÓN
 * ============================================================
 * Estos tipos se usan en toda la aplicación para garantizar
 * que los datos coinciden con el esquema de la base de datos.
 */

export type UsuarioApp = typeof usuarioApp.$inferSelect;
export type NuevoUsuarioApp = typeof usuarioApp.$inferInsert;

export type Perfil = typeof perfil.$inferSelect;
export type NuevoPerfil = typeof perfil.$inferInsert;

export type Tema = typeof tema.$inferSelect;
export type NuevoTema = typeof tema.$inferInsert;

export type Actividad = typeof actividad.$inferSelect;
export type NuevaActividad = typeof actividad.$inferInsert;

export type ConfiguracionPlataforma = typeof configuracionPlataforma.$inferSelect;
export type NuevaConfiguracionPlataforma = typeof configuracionPlataforma.$inferInsert;

export type EventoProgreso = typeof eventoProgreso.$inferSelect;
export type NuevoEventoProgreso = typeof eventoProgreso.$inferInsert;

export type Senda = typeof senda.$inferSelect;
export type GrupoEdad = typeof grupoEdad.$inferSelect;

export type Club = typeof club.$inferSelect;
export type Logro = typeof logro.$inferSelect;
export type ReglaNivel = typeof reglaNivel.$inferSelect;
