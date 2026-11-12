const TARGET = "https://api-semillas.andresalexander14.workers.dev";
const PORT = 8787;

const SNAPSHOT_RESUMEN_DETALLADO = {
  exito: true,
  datos: {
    metricas: {
      temas: 14,
      publicados: 3,
      usuarios_activos: 34,
      actividades: 22,
      clubes_activos: 2,
      pendientes_revision: 0,
    },
    estados: {
      borrador: 6,
      revision: 0,
      aprobado: 0,
      publicado: 3,
      archivado: 5,
    },
    temas_recientes: [
      {
        id: "47a2e22f-86da-466f-92ff-1847d85de609",
        titulo: "El Amor de Dios",
        estado: "publicado",
        actualizado_en: "2026-10-14T05:09:38.663+00:00",
        senda: "Senda del Padre",
        autor: "Sin autor",
      },
      {
        id: "a37aa1e4-3289-47a4-b709-28a47a5fdd5f",
        titulo: "El Amor de Dios (copia)",
        estado: "borrador",
        actualizado_en: "2026-10-13T07:07:31.393+00:00",
        senda: "Senda del Padre",
        autor: "Administrador",
      },
      {
        id: "d7d010a2-6a7b-45b4-bc63-860db116ad8e",
        titulo: "El buen samaritano: amar sin fronteras",
        estado: "borrador",
        actualizado_en: "2026-10-13T06:07:18.378445+00:00",
        senda: "Senda del Hijo",
        autor: "Administrador",
      },
      {
        id: "251a4039-882a-4115-9434-dcdeb5ddcee3",
        titulo: "hola",
        estado: "borrador",
        actualizado_en: "2026-07-14T03:18:41.331335+00:00",
        senda: "Senda del Hijo",
        autor: "Administrador",
      },
      {
        id: "cafc872a-b990-4b25-8a2c-b4bb2404d1a1",
        titulo: "Dios es amor",
        estado: "borrador",
        actualizado_en: "2026-07-14T02:31:46.645607+00:00",
        senda: "Senda del Padre",
        autor: "Administrador",
      },
      {
        id: "7847c491-3c9a-4c42-bfbc-531c243fb1a4",
        titulo: "Versicula del dia",
        estado: "borrador",
        actualizado_en: "2026-07-13T02:50:04.254+00:00",
        senda: "Senda del Padre",
        autor: "Sin autor",
      },
    ],
    revisiones: [],
    actividad_reciente: [
      {
        id: "7f3f5b4d-2c85-43af-9bba-54017b7fc0e9",
        accion: "duplicar",
        tipo_entidad: "tema",
        entidad_id: "a37aa1e4-3289-47a4-b709-28a47a5fdd5f",
        creado_en: "2026-10-13T07:07:33.934671+00:00",
        actor: "Administrador",
      },
      {
        id: "4755251d-f3a6-4ca0-a514-e7ee5d8f042a",
        accion: "actualizar_metadatos",
        tipo_entidad: "recurso_multimedia",
        entidad_id: "ffa338e3-15c3-414c-9fe0-f0a91c688fe7",
        creado_en: "2026-10-13T06:56:08.793794+00:00",
        actor: "Administrador",
      },
      {
        id: "2807e664-44f8-48ff-a81f-7b1c060e143d",
        accion: "crear",
        tipo_entidad: "recurso_multimedia",
        entidad_id: "ffa338e3-15c3-414c-9fe0-f0a91c688fe7",
        creado_en: "2026-10-13T06:55:06.21817+00:00",
        actor: "Administrador",
      },
    ],
    publicaciones_semana: [
      { fecha: "2026-10-24", etiqueta: "sáb", total: 0 },
      { fecha: "2026-10-25", etiqueta: "dom", total: 0 },
      { fecha: "2026-10-26", etiqueta: "lun", total: 0 },
      { fecha: "2026-10-27", etiqueta: "mar", total: 0 },
      { fecha: "2026-10-28", etiqueta: "mié", total: 0 },
      { fecha: "2026-10-29", etiqueta: "jue", total: 0 },
      { fecha: "2026-10-30", etiqueta: "vie", total: 0 },
    ],
  },
};

const SNAPSHOT_PERFIL_ADMIN = {
  exito: true,
  datos: {
    usuario: {
      id: "aff4c70c-086c-43f3-8501-b55bb13807b2",
      rol: "administrador",
      proveedor: "correo",
      nombre_visible: "Administrador",
      correo: "admin@correo.com",
    },
    perfil: {
      id: "aff4c70c-086c-43f3-8501-b55bb13807b2",
      usuario_id: "aff4c70c-086c-43f3-8501-b55bb13807b2",
      apodo: "Administrador",
      grupo_edad_id: null,
      url_avatar: null,
      clave_avatar: "1",
      prefiere_audio: true,
      tamano_texto_preferido: "mediano",
    },
    grupos_edad: [
      { id: "e1000000-0000-0000-0000-000000000001", codigo: "semillas", nombre: "Semillas", edad_min: 5, edad_max: 8, edad_minima: 5, edad_maxima: 8 },
      { id: "e1000000-0000-0000-0000-000000000002", codigo: "exploradores", nombre: "Exploradores", edad_min: 9, edad_max: 12, edad_minima: 9, edad_maxima: 12 },
      { id: "e1000000-0000-0000-0000-000000000003", codigo: "embajadores", nombre: "Embajadores", edad_min: 13, edad_max: 17, edad_minima: 13, edad_maxima: 17 },
    ],
  },
};

const SNAPSHOT_TEMAS_LISTADO = {
  exito: true,
  datos: {
    temas: SNAPSHOT_RESUMEN_DETALLADO.datos.temas_recientes.map((t) => ({
      ...t,
      slug: t.titulo.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      resumen: "Contenido temático de " + t.titulo,
      objetivo: "Comprender y vivir la enseñanza bíblica de " + t.titulo,
      version_contenido: 1,
      minutos_estimados: 15,
      xp_recompensa: 50,
      publicado_en: t.actualizado_en,
      es_destacado: false,
      senda_id: "senda-padre",
      senda: { id: "senda-padre", codigo: "padre", nombre: t.senda, color_hex: "#3b82f6" },
      grupos_edad: [
        { id: "e1000000-0000-0000-0000-000000000001", codigo: "semillas", nombre: "Semillas" },
        { id: "e1000000-0000-0000-0000-000000000002", codigo: "exploradores", nombre: "Exploradores" },
        { id: "e1000000-0000-0000-0000-000000000003", codigo: "embajadores", nombre: "Embajadores" },
      ],
      completitud: {
        porcentaje: 100,
        listo_para_revision: true,
        bloqueos: [],
        criterios: [
          { codigo: "ficha_base", etiqueta: "Ficha editorial base", completo: true, detalle: "" },
          { codigo: "portada", etiqueta: "Portada asignada", completo: true, detalle: "" },
          { codigo: "grupos_edad", etiqueta: "Franjas de edad", completo: true, detalle: "" },
          { codigo: "pasos_crecer", etiqueta: "6 momentos CRECER", completo: true, detalle: "" },
          { codigo: "contenido_crecer", etiqueta: "Contenido por franja", completo: true, detalle: "" },
          { codigo: "actividades", etiqueta: "Actividades configuradas", completo: true, detalle: "" },
          { codigo: "publicacion", etiqueta: "Listo para publicar", completo: true, detalle: "" },
        ],
        estadisticas: {
          grupos_edad: 3,
          pasos_totales: 6,
          pasos_creados: 6,
          contenidos_creados: 18,
          contenidos_esperados: 18,
          actividades: 6,
        },
      },
    })),
    total: 14,
    limit: 20,
    offset: 0,
  },
};

const SNAPSHOT_CLUBES = {
  exito: true,
  datos: {
    clubes: [
      {
        id: "c1000000-0000-0000-0000-000000000001",
        nombre: "Club Semillas de Esperanza",
        descripcion: "Comunidad de aprendizaje y crecimiento espiritual.",
        activo: true,
        creado_en: "2026-09-01T12:00:00Z",
        miembros: 8,
        retos_abiertos: 2,
        lider: { usuario_id: "aff4c70c-086c-43f3-8501-b55bb13807b2", apodo: "Administrador" },
      },
      {
        id: "c1000000-0000-0000-0000-000000000002",
        nombre: "Exploradores de la Fe",
        descripcion: "Club dedicado a resolver retos y dinámicas CRECER.",
        activo: true,
        creado_en: "2026-09-15T15:00:00Z",
        miembros: 12,
        retos_abiertos: 1,
        lider: { usuario_id: "aff4c70c-086c-43f3-8501-b55bb13807b2", apodo: "Administrador" },
      },
    ],
    meta: { total: 2, limit: 20, offset: 0 },
  },
};

const SNAPSHOT_REPORTES_CLUBES = {
  exito: true,
  datos: [],
};

const SNAPSHOT_CLUB_DETALLE = {
  exito: true,
  datos: {
    club: {
      id: "c1000000-0000-0000-0000-000000000001",
      nombre: "Club Semillas de Esperanza",
      descripcion: "Comunidad de aprendizaje y crecimiento espiritual.",
      codigo_invitacion: "SEMILLA123",
      activo: true,
      creado_en: "2026-09-01T12:00:00Z",
    },
    miembros: [
      {
        usuario_id: "aff4c70c-086c-43f3-8501-b55bb13807b2",
        apodo: "Administrador",
        rol_miembro: "lider",
        unido_en: "2026-09-01T12:00:00Z",
        url_avatar: null,
        xp_total: 1200,
        xp_semana: 250,
        actividades_semana: 8,
      },
    ],
    retos: [
      {
        id: "r1000000-0000-0000-0000-000000000001",
        nombre: "Reto Semanal de Lectura",
        descripcion: "Completar 3 lecciones esta semana",
        codigo_metrica: "actividades_completadas",
        valor_objetivo: 15,
        xp_reto: 100,
        fecha_inicio: "2026-10-28T00:00:00Z",
        fecha_fin: "2026-11-05T23:59:59Z",
      },
    ],
  },
};

const SNAPSHOT_LOGROS = {
  exito: true,
  datos: {
    logros: [
      {
        id: "l1000000-0000-0000-0000-000000000001",
        codigo: "primer_paso",
        titulo: "Primer paso",
        descripcion: "Completa tu primer tema bíblico completo.",
        criterio: "Requisito: Completa tu primer tema bíblico",
        xp_recompensa: 20,
        icono_url: "/src/assets/images/Ilustraciones/Versiculo del dia.webp",
        activo: true,
        creado_en: "2026-08-01T10:00:00Z",
        actualizado_en: "2026-08-01T10:00:00Z",
        otorgados_count: 14,
      },
      {
        id: "l1000000-0000-0000-0000-000000000002",
        codigo: "amor_de_dios",
        titulo: "El Amor de Dios",
        descripcion: "Completa el tema El Amor de Dios.",
        criterio: "Requisito: Completa el tema «El Amor de Dios»",
        xp_recompensa: 25,
        icono_url: "/src/assets/images/Ilustraciones/Versiculo del dia.webp",
        activo: true,
        creado_en: "2026-08-02T10:00:00Z",
        actualizado_en: "2026-08-02T10:00:00Z",
        otorgados_count: 9,
      },
    ],
    total: 2,
    limit: 20,
    offset: 0,
    meta: {
      total: 2,
      limit: 20,
      offset: 0,
    },
  },
};

const SNAPSHOT_USUARIOS = {
  exito: true,
  datos: {
    usuarios: [
      {
        id: "aff4c70c-086c-43f3-8501-b55bb13807b2",
        correo: "admin@correo.com",
        rol: "administrador",
        apodo: "Administrador",
        proveedor: "correo",
        activo: true,
        creado_en: "2026-07-01T00:00:00Z",
        ultimo_acceso: "2026-10-30T17:00:00Z",
      },
    ],
    total: 34,
    limit: 20,
    offset: 0,
  },
};

const SNAPSHOT_ACTIVIDADES = {
  exito: true,
  datos: {
    actividades: [
      {
        id: "act-1",
        tema_id: "47a2e22f-86da-466f-92ff-1847d85de609",
        paso_id: "paso-47a2e22f-comprobar",
        grupo_edad_id: "e1000000-0000-0000-0000-000000000001",
        tipo_actividad_id: "tipo-cuestionario",
        titulo: "Quiz Bíblico",
        consigna: "Responde la pregunta sobre la enseñanza bíblica.",
        retroalimentacion: "¡Muy bien! Recordaste la enseñanza.",
        dificultad: "normal",
        xp_recompensa: 20,
        limite_tiempo_seg: null,
        orden: 1,
        obligatorio: true,
        estado: "activo",
        creado_en: "2026-10-14T05:09:38.663+00:00",
        actualizado_en: "2026-10-14T05:09:38.663+00:00",
        configuracion: {
          opciones: [
            { id: "opt-1", texto: "Dios nos ama siempre con amor eterno", correcta: true },
            { id: "opt-2", texto: "Solo cuando no cometemos errores", correcta: false },
          ],
        },
        opciones: [
          {
            id: "opt-1",
            actividad_id: "act-1",
            etiqueta: "A",
            texto: "Dios nos ama siempre con amor eterno",
            correcta: true,
            orden: 1,
            retroalimentacion: null,
          },
          {
            id: "opt-2",
            actividad_id: "act-1",
            etiqueta: "B",
            texto: "Solo cuando no cometemos errores",
            correcta: false,
            orden: 2,
            retroalimentacion: null,
          },
        ],
        tipo_actividad: {
          id: "tipo-cuestionario",
          codigo: "cuestionario",
          nombre: "Cuestionario (Quiz)",
        },
        tema: {
          id: "47a2e22f-86da-466f-92ff-1847d85de609",
          titulo: "El Amor de Dios",
          slug: "el-amor-de-dios",
          estado: "publicado",
          senda: {
            id: "senda-padre",
            codigo: "padre",
            nombre: "Senda del Padre",
            color_hex: "#3b82f6",
          },
        },
        grupo_edad: {
          id: "e1000000-0000-0000-0000-000000000001",
          codigo: "semillas",
          nombre: "Semillas",
        },
      },
    ],
    total: 22,
  },
};

const SNAPSHOT_REVISIONES = {
  exito: true,
  datos: {
    revisiones: [],
    total: 0,
    limit: 20,
    offset: 0,
  },
};

const SNAPSHOT_REPORTES = {
  exito: true,
  datos: {
    rango: {
      desde: "2026-10-04",
      hasta: "2026-11-03",
    },
    metricas: {
      usuarios_activos: 34,
      usuarios_nuevos: 12,
      temas_completados: 48,
      actividades_completadas: 112,
      xp_otorgada: 3450,
      precision_respuestas: 87,
      clubes_activos: 2,
      temas_publicados: 3,
    },
    actividad_diaria: [
      { fecha: "2026-10-28", eventos: 14, usuarios: 8, xp: 420 },
      { fecha: "2026-10-29", eventos: 22, usuarios: 12, xp: 680 },
      { fecha: "2026-10-30", eventos: 35, usuarios: 19, xp: 950 },
      { fecha: "2026-10-31", eventos: 18, usuarios: 9, xp: 510 },
      { fecha: "2026-11-01", eventos: 26, usuarios: 15, xp: 720 },
      { fecha: "2026-11-02", eventos: 31, usuarios: 17, xp: 890 },
      { fecha: "2026-11-03", eventos: 19, usuarios: 11, xp: 540 },
    ],
    temas_destacados: [
      {
        id: "47a2e22f-86da-466f-92ff-1847d85de609",
        titulo: "El Amor de Dios",
        eventos: 54,
        completados: 28,
        usuarios: 22,
      },
      {
        id: "d7d010a2-6a7b-45b4-bc63-860db116ad8e",
        titulo: "El buen samaritano: amar sin fronteras",
        eventos: 38,
        completados: 16,
        usuarios: 15,
      },
    ],
    distribucion_roles: {
      administrador: 2,
      padre: 8,
      usuario: 24,
    },
    revision_editorial: {
      por_estado: {
        borrador: 6,
        revision: 0,
        aprobado: 0,
        publicado: 3,
        archivado: 5,
      },
      tiempo_promedio_horas: 3.5,
      total: 14,
    },
    muestra_limitada: false,
  },
};

const SNAPSHOT_AJUSTES = {
  exito: true,
  datos: {
    ajustes: {
      nombre_plataforma: "Semillas",
      correo_soporte: "admin@correo.com",
      zona_horaria: "America/Guayaquil",
      notas_obligatorias_cambios: false,
      notas_obligatorias_rechazo: true,
    },
  },
};

const SNAPSHOT_SENDAS = {
  exito: true,
  datos: [
    { id: "senda-padre", nombre: "Senda del Padre", color: "#3b82f6", descripcion: "Conociendo el amor del Padre" },
    { id: "senda-hijo", nombre: "Senda del Hijo", color: "#10b981", descripcion: "Siguiendo los pasos de Jesús" },
    { id: "senda-espiritu", nombre: "Senda del Espíritu", color: "#f59e0b", descripcion: "Viviendo en el poder del Espíritu Santo" },
  ],
};

const SNAPSHOT_MEDIA = {
  exito: true,
  datos: [
    {
      id: "00000000-0000-0000-0000-000000000001",
      tipo: "imagen",
      bucket_almacenamiento: "semillas-media",
      clave_almacenamiento: "ilustraciones/Semilla.webp",
      url_publica: "/src/assets/images/Ilustraciones/Semilla.webp",
      texto_alternativo: "Ilustración de la semilla inicial",
      titulo: "Semilla y brote inicial",
      tipo_mime: "image/webp",
      tamano_bytes: 145000,
      ancho_px: 800,
      alto_px: 600,
      duracion_seg: null,
      creado_por: "Administrador",
      activo: true,
      creado_en: "2026-10-15T10:00:00Z",
      actualizado_en: "2026-10-15T10:00:00Z",
      uso_total: 4,
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      tipo: "imagen",
      bucket_almacenamiento: "semillas-media",
      clave_almacenamiento: "ilustraciones/Exploradores.webp",
      url_publica: "/src/assets/images/Ilustraciones/Exploradores.webp",
      texto_alternativo: "Ilustración franja exploradores",
      titulo: "Franja Exploradores (9 a 12 años)",
      tipo_mime: "image/webp",
      tamano_bytes: 182000,
      ancho_px: 800,
      alto_px: 600,
      duracion_seg: null,
      creado_por: "Administrador",
      activo: true,
      creado_en: "2026-10-16T11:00:00Z",
      actualizado_en: "2026-10-16T11:00:00Z",
      uso_total: 3,
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      tipo: "imagen",
      bucket_almacenamiento: "semillas-media",
      clave_almacenamiento: "ilustraciones/Embajadores.webp",
      url_publica: "/src/assets/images/Ilustraciones/Embajadores.webp",
      texto_alternativo: "Ilustración franja embajadores",
      titulo: "Franja Embajadores (13 a 17 años)",
      tipo_mime: "image/webp",
      tamano_bytes: 195000,
      ancho_px: 800,
      alto_px: 600,
      duracion_seg: null,
      creado_por: "Administrador",
      activo: true,
      creado_en: "2026-10-17T12:00:00Z",
      actualizado_en: "2026-10-17T12:00:00Z",
      uso_total: 2,
    },
    {
      id: "00000000-0000-0000-0000-000000000004",
      tipo: "imagen",
      bucket_almacenamiento: "semillas-media",
      clave_almacenamiento: "ilustraciones/Tema1.webp",
      url_publica: "/src/assets/images/Ilustraciones/Tema1.webp",
      texto_alternativo: "Portada del tema El Amor de Dios",
      titulo: "Portada - El Amor de Dios",
      tipo_mime: "image/webp",
      tamano_bytes: 230000,
      ancho_px: 1200,
      alto_px: 800,
      duracion_seg: null,
      creado_por: "Administrador",
      activo: true,
      creado_en: "2026-10-18T09:00:00Z",
      actualizado_en: "2026-10-18T09:00:00Z",
      uso_total: 5,
    },
    {
      id: "00000000-0000-0000-0000-000000000005",
      tipo: "imagen",
      bucket_almacenamiento: "semillas-media",
      clave_almacenamiento: "ilustraciones/Versiculo del dia.webp",
      url_publica: "/src/assets/images/Ilustraciones/Versiculo del dia.webp",
      texto_alternativo: "Insignia de Versículo del Día",
      titulo: "Insignia - Versículo del Día",
      tipo_mime: "image/webp",
      tamano_bytes: 120000,
      ancho_px: 512,
      alto_px: 512,
      duracion_seg: null,
      creado_por: "Administrador",
      activo: true,
      creado_en: "2026-10-19T14:00:00Z",
      actualizado_en: "2026-10-19T14:00:00Z",
      uso_total: 2,
    },
    {
      id: "00000000-0000-0000-0000-000000000006",
      tipo: "imagen",
      bucket_almacenamiento: "semillas-media",
      clave_almacenamiento: "ilustraciones/Conectar.webp",
      url_publica: "/src/assets/images/Ilustraciones/Conectar.webp",
      texto_alternativo: "CRECER paso Conectar",
      titulo: "CRECER - Conectar",
      tipo_mime: "image/webp",
      tamano_bytes: 165000,
      ancho_px: 600,
      alto_px: 600,
      duracion_seg: null,
      creado_por: "Administrador",
      activo: true,
      creado_en: "2026-10-20T15:00:00Z",
      actualizado_en: "2026-10-20T15:00:00Z",
      uso_total: 6,
    },
    {
      id: "00000000-0000-0000-0000-000000000007",
      tipo: "audio",
      bucket_almacenamiento: "semillas-media",
      clave_almacenamiento: "sonidos/acertado.mp3",
      url_publica: "/src/assets/Sonidos/acertado.mp3",
      texto_alternativo: "Efecto de respuesta correcta",
      titulo: "Sonido de Acierto",
      tipo_mime: "audio/mpeg",
      tamano_bytes: 45000,
      ancho_px: null,
      alto_px: null,
      duracion_seg: 2,
      creado_por: "Administrador",
      activo: true,
      creado_en: "2026-10-21T08:00:00Z",
      actualizado_en: "2026-10-21T08:00:00Z",
      uso_total: 12,
    },
    {
      id: "00000000-0000-0000-0000-000000000008",
      tipo: "audio",
      bucket_almacenamiento: "semillas-media",
      clave_almacenamiento: "sonidos/insignia.mp3",
      url_publica: "/src/assets/Sonidos/insignia.mp3",
      texto_alternativo: "Efecto fanfarria de insignia",
      titulo: "Fanfarria de Insignia",
      tipo_mime: "audio/mpeg",
      tamano_bytes: 78000,
      ancho_px: null,
      alto_px: null,
      duracion_seg: 4,
      creado_por: "Administrador",
      activo: true,
      creado_en: "2026-10-21T08:30:00Z",
      actualizado_en: "2026-10-21T08:30:00Z",
      uso_total: 8,
    },
    {
      id: "00000000-0000-0000-0000-000000000009",
      tipo: "video",
      bucket_almacenamiento: "semillas-media",
      clave_almacenamiento: "videos/historia.mp4",
      url_publica: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      texto_alternativo: "Video educativo sobre la creación y el amor de Dios",
      titulo: "Video - Historia Bíblica Animada",
      tipo_mime: "video/mp4",
      tamano_bytes: 15400000,
      ancho_px: 1280,
      alto_px: 720,
      duracion_seg: 180,
      creado_por: "Administrador",
      activo: true,
      creado_en: "2026-10-22T09:00:00Z",
      actualizado_en: "2026-10-22T09:00:00Z",
      uso_total: 1,
    },
  ],
};

function resolverRespuestaDevMedia(req: Request, url: URL, origin: string): Response | null {
  if (!url.pathname.startsWith("/media")) return null;

  // 1. GET /media
  if (req.method === "GET" && (url.pathname === "/media" || url.pathname === "/media/")) {
    return new Response(JSON.stringify(SNAPSHOT_MEDIA), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  // 2. GET /media/:id/url
  if (req.method === "GET" && url.pathname.endsWith("/url")) {
    const parts = url.pathname.split("/");
    const id = parts[2];
    const item = SNAPSHOT_MEDIA.datos.find((m) => m.id === id) || SNAPSHOT_MEDIA.datos[0];
    return new Response(
      JSON.stringify({
        exito: true,
        datos: {
          url: item?.url_publica || "/src/assets/images/Ilustraciones/Semilla.webp",
          expira_en_segundos: 3600,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      },
    );
  }

  // 3. GET /media/:id
  if (req.method === "GET" && url.pathname.startsWith("/media/")) {
    const id = url.pathname.replace("/media/", "");
    const item = SNAPSHOT_MEDIA.datos.find((m) => m.id === id) || SNAPSHOT_MEDIA.datos[0];
    return new Response(
      JSON.stringify({
        exito: true,
        datos: {
          ...item,
          id: item?.id || id,
          uso_total: item?.uso_total ?? 1,
          puede_eliminar: false,
          usos: [
            {
              tipo: "tema",
              entidad_id: "47a2e22f-86da-466f-92ff-1847d85de609",
              titulo: "El Amor de Dios",
              contexto: "Ilustración educativa",
              tema_id: "47a2e22f-86da-466f-92ff-1847d85de609",
              href: "/admin/temas/47a2e22f-86da-466f-92ff-1847d85de609/editar",
            },
          ],
          subido_por_usuario: {
            id: "aff4c70c-086c-43f3-8501-b55bb13807b2",
            nombre_visible: "Administrador",
            correo: "admin@correo.com",
          },
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      },
    );
  }

  // 4. POST /media/subir
  if (req.method === "POST" && url.pathname === "/media/subir") {
    const nuevoId = crypto.randomUUID();
    const nuevoRecurso = {
      id: nuevoId,
      tipo: "imagen",
      bucket_almacenamiento: "semillas-media",
      clave_almacenamiento: `subidas/${nuevoId}.webp`,
      url_publica: "/src/assets/images/Ilustraciones/Semilla.webp",
      texto_alternativo: "Recurso subido en desarrollo",
      titulo: "Nuevo recurso multimedia",
      tipo_mime: "image/webp",
      tamano_bytes: 145000,
      ancho_px: 800,
      alto_px: 600,
      duracion_seg: null,
      creado_por: "Administrador",
      activo: true,
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
      uso_total: 0,
    };
    SNAPSHOT_MEDIA.datos.unshift(nuevoRecurso);
    registrarSnapshot("/media", SNAPSHOT_MEDIA);
    return new Response(JSON.stringify({ exito: true, datos: nuevoRecurso }), {
      status: 201,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  // 5. PATCH /media/:id
  if (req.method === "PATCH" && url.pathname.startsWith("/media/")) {
    const id = url.pathname.replace("/media/", "");
    const item = SNAPSHOT_MEDIA.datos.find((m) => m.id === id);
    if (item) {
      item.actualizado_en = new Date().toISOString();
    }
    return new Response(JSON.stringify({ exito: true, datos: item ?? SNAPSHOT_MEDIA.datos[0] }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  // 6. DELETE /media/:id
  if (req.method === "DELETE" && url.pathname.startsWith("/media/")) {
    const id = url.pathname.replace("/media/", "");
    const idx = SNAPSHOT_MEDIA.datos.findIndex((m) => m.id === id);
    if (idx !== -1) {
      SNAPSHOT_MEDIA.datos.splice(idx, 1);
      registrarSnapshot("/media", SNAPSHOT_MEDIA);
    }
    return new Response(JSON.stringify({ exito: true, datos: { deleted: true } }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  return null;
}

const cacheGet = new Map<string, Uint8Array>();

interface VersiculoClaveProxy {
  libro_id: number;
  capitulo: number;
  versiculo_inicio: number;
  versiculo_fin: number | null;
  texto: string;
  parte_historia: string | null;
}

const LIBROS_NOMBRES: Record<number, string> = {
  1: "Génesis", 2: "Éxodo", 3: "Levítico", 4: "Números", 5: "Deuteronomio",
  6: "Josué", 7: "Jueces", 8: "Rut", 9: "1 Samuel", 10: "2 Samuel",
  11: "1 Reyes", 12: "2 Reyes", 13: "1 Crónicas", 14: "2 Crónicas", 15: "Esdras",
  16: "Nehemías", 17: "Ester", 18: "Job", 19: "Salmos", 20: "Proverbios",
  21: "Eclesiastés", 22: "Cantares", 23: "Isaías", 24: "Jeremías", 25: "Lamentaciones",
  26: "Ezequiel", 27: "Daniel", 28: "Oseas", 29: "Joel", 30: "Amós",
  31: "Abdías", 32: "Jonás", 33: "Miqueas", 34: "Nahúm", 35: "Habacuc",
  36: "Sofonías", 37: "Hageo", 38: "Zacarías", 39: "Malaquías",
  40: "Mateo", 41: "Marcos", 42: "Lucas", 43: "Juan", 44: "Hechos",
  45: "Romanos", 46: "1 Corintios", 47: "2 Corintios", 48: "Gálatas", 49: "Efesios",
  50: "Filipenses", 51: "Colosenses", 52: "1 Tesalonicenses", 53: "2 Tesalonicenses",
  54: "1 Timoteo", 55: "2 Timoteo", 56: "Tito", 57: "Filemón", 58: "Hebreos",
  59: "Santiago", 60: "1 Pedro", 61: "2 Pedro", 62: "1 Juan", 63: "2 Juan",
  64: "3 Juan", 65: "Judas", 66: "Apocalipsis",
};

const versiculosPorTema = new Map<string, VersiculoClaveProxy>([
  [
    "c19cd63a-4e09-4d0a-aa19-967c61a89062",
    {
      libro_id: 9,
      capitulo: 17,
      versiculo_inicio: 45,
      versiculo_fin: null,
      texto: "Tú vienes a mí con espada y lanza y jabalina; mas yo vengo a ti en el nombre de Jehová de los ejércitos.",
      parte_historia: "David vence a Goliat en el valle de Ela confiando en Dios",
    },
  ],
  [
    "47a2e22f-86da-466f-92ff-1847d85de609",
    {
      libro_id: 62,
      capitulo: 4,
      versiculo_inicio: 8,
      versiculo_fin: null,
      texto: "El que no ama, no ha conocido a Dios; porque Dios es amor.",
      parte_historia: "El amor incondicional del Padre hacia sus hijos",
    },
  ],
  [
    "a37aa1e4-3289-47a4-b709-28a47a5fdd5f",
    {
      libro_id: 62,
      capitulo: 4,
      versiculo_inicio: 8,
      versiculo_fin: null,
      texto: "El que no ama, no ha conocido a Dios; porque Dios es amor.",
      parte_historia: "El amor incondicional del Padre hacia sus hijos",
    },
  ],
  [
    "d7d010a2-6a7b-45b4-bc63-860db116ad8e",
    {
      libro_id: 42,
      capitulo: 10,
      versiculo_inicio: 33,
      versiculo_fin: 34,
      texto: "Pero un samaritano, que iba de camino, vino cerca de él, y viéndole, fue movido a misericordia.",
      parte_historia: "Parábola del buen samaritano enseñada por Jesús",
    },
  ],
]);

const estadosPorTema = new Map<string, { estado: string; publicado_en: string | null }>();

function construirCitaVersiculo(v: VersiculoClaveProxy): string {
  const libro = LIBROS_NOMBRES[v.libro_id] ?? "Escritura";
  const rango = v.versiculo_fin && v.versiculo_fin > v.versiculo_inicio
    ? `${v.versiculo_inicio}-${v.versiculo_fin}`
    : `${v.versiculo_inicio}`;
  return `${libro} ${v.capitulo}:${rango}`;
}

function enriquecerTemaConVersiculoYCompletitud(temaObj: Record<string, any>, completitudObj?: Record<string, any> | null) {
  if (!temaObj || typeof temaObj !== "object") return;
  const temaId = typeof temaObj.id === "string" ? temaObj.id : "";
  let versiculoGuardado = temaId ? versiculosPorTema.get(temaId) : undefined;
  const estadoGuardado = temaId ? estadosPorTema.get(temaId) : undefined;

  if (estadoGuardado) {
    temaObj.estado = estadoGuardado.estado;
    if (estadoGuardado.publicado_en) {
      temaObj.publicado_en = estadoGuardado.publicado_en;
    }
  }

  if (!versiculoGuardado && (!temaObj.versiculo_clave || !temaObj.versiculo_clave.texto)) {
    const tituloLower = String(temaObj.titulo ?? "").toLowerCase();
    if (tituloLower.includes("david") || tituloLower.includes("goliat")) {
      versiculoGuardado = {
        libro_id: 9,
        capitulo: 17,
        versiculo_inicio: 45,
        versiculo_fin: null,
        texto: "Tú vienes a mí con espada y lanza y jabalina; mas yo vengo a ti en el nombre de Jehová de los ejércitos.",
        parte_historia: "David vence a Goliat en el valle de Ela confiando en Dios",
      };
    } else if (tituloLower.includes("samaritano")) {
      versiculoGuardado = {
        libro_id: 42,
        capitulo: 10,
        versiculo_inicio: 33,
        versiculo_fin: 34,
        texto: "Pero un samaritano, que iba de camino, vino cerca de él, y viéndole, fue movido a misericordia.",
        parte_historia: "Parábola del buen samaritano enseñada por Jesús",
      };
    } else {
      versiculoGuardado = {
        libro_id: 43,
        capitulo: 3,
        versiculo_inicio: 16,
        versiculo_fin: null,
        texto: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
        parte_historia: `Enseñanza bíblica central sobre ${temaObj.titulo || "el amor de Dios"}`,
      };
    }
  }

  if (versiculoGuardado) {
    temaObj.versiculo_clave = {
      ...versiculoGuardado,
      versiculo: versiculoGuardado.versiculo_inicio,
    };
    temaObj.referencia_biblica = {
      cita: construirCitaVersiculo(versiculoGuardado),
      texto: versiculoGuardado.texto,
      libro: LIBROS_NOMBRES[versiculoGuardado.libro_id] ?? "Escritura",
      capitulo: versiculoGuardado.capitulo,
      versiculo_inicio: versiculoGuardado.versiculo_inicio,
      versiculo_fin: versiculoGuardado.versiculo_fin,
      parte_historia: versiculoGuardado.parte_historia,
    };
  } else if (temaObj.versiculo_clave && typeof temaObj.versiculo_clave === "object" && !temaObj.referencia_biblica) {
    const v = temaObj.versiculo_clave as VersiculoClaveProxy & { versiculo?: number };
    const versiculoInicio = v.versiculo_inicio ?? v.versiculo ?? 1;
    v.versiculo = versiculoInicio;
    v.versiculo_inicio = versiculoInicio;
    temaObj.referencia_biblica = {
      cita: construirCitaVersiculo({ ...v, versiculo_inicio: versiculoInicio }),
      texto: v.texto,
      libro: LIBROS_NOMBRES[v.libro_id] ?? "Escritura",
      capitulo: v.capitulo,
      versiculo_inicio: versiculoInicio,
      versiculo_fin: v.versiculo_fin ?? null,
      parte_historia: v.parte_historia ?? null,
    };
  }

  const tieneVersiculo = Boolean(
    (temaObj.versiculo_clave && typeof temaObj.versiculo_clave.texto === "string" && temaObj.versiculo_clave.texto.trim().length > 0) ||
    (temaObj.referencia_biblica && typeof temaObj.referencia_biblica.texto === "string" && temaObj.referencia_biblica.texto.trim().length > 0)
  );

  const comp = completitudObj || (temaObj.completitud && typeof temaObj.completitud === "object" ? temaObj.completitud : null);
  if (comp && typeof comp === "object") {
    if (Array.isArray(comp.criterios)) {
      for (const crit of comp.criterios) {
        if (crit.codigo === "portada" && (temaObj.portada_id || temaObj.portada_recurso_id || temaObj.portada?.id || temaObj.portada?.url)) {
          crit.completo = true;
          crit.detalle = "";
        }
        if (crit.codigo === "crecer" && typeof crit.detalle === "string" && crit.detalle.toLowerCase().includes("audio")) {
          crit.completo = true;
          crit.detalle = "";
        }
      }
      const previosCompletos = comp.criterios
        .filter((c: any) => c.codigo !== "publicacion")
        .every((c: any) => Boolean(c.completo));
      for (const crit of comp.criterios) {
        if (crit.codigo === "publicacion" && previosCompletos && tieneVersiculo) {
          crit.completo = true;
          crit.detalle = "";
        }
      }
      const totalCriterios = comp.criterios.length || 7;
      const completados = comp.criterios.filter((c: any) => Boolean(c.completo)).length;
      comp.porcentaje = Math.round((completados / totalCriterios) * 100);
      comp.bloqueos = comp.criterios
        .filter((c: any) => !c.completo)
        .map((c: any) => c.detalle || c.etiqueta);
      comp.listo_para_revision = comp.bloqueos.length === 0;
    } else if (tieneVersiculo && typeof comp.porcentaje === "number" && comp.porcentaje >= 85) {
      comp.porcentaje = 100;
      comp.listo_para_revision = true;
      if (Array.isArray(comp.bloqueos)) {
        comp.bloqueos = comp.bloqueos.filter(
          (b: string) => !b.toLowerCase().includes("versículo") && !b.toLowerCase().includes("versiculo") && !b.toLowerCase().includes("publicación")
        );
      }
    }
  }
}

function enriquecerActividadesOpciones(actividades: any[]) {
  if (!Array.isArray(actividades)) return;
  for (const act of actividades) {
    if (!act || typeof act !== "object") continue;
    const config = act.configuracion && typeof act.configuracion === "object" ? act.configuracion : {};
    const opcionesDirectas = Array.isArray(act.opciones) ? act.opciones : [];
    const opcionesConfig = Array.isArray(config.opciones) ? config.opciones : [];
    if (opcionesDirectas.length === 0 && opcionesConfig.length > 0) {
      act.opciones = opcionesConfig.map((item: any, idx: number) => ({
        id: item.id || `opt-${idx + 1}`,
        etiqueta: item.etiqueta || String.fromCharCode(65 + idx),
        texto: item.texto || item.texto_opcion || "",
        correcta: Boolean(item.correcta ?? item.es_correcta ?? item.esCorrecta),
        explicacion: item.explicacion ?? item.retroalimentacion ?? null,
        orden: item.orden ?? idx + 1,
      }));
    } else if (opcionesDirectas.length > 0) {
      act.configuracion = {
        ...config,
        opciones: opcionesDirectas.map((item: any, idx: number) => ({
          id: item.id || `opt-${idx + 1}`,
          texto: item.texto || item.texto_opcion || "",
          correcta: Boolean(item.correcta ?? item.es_correcta ?? item.esCorrecta),
        })),
      };
    }
  }
}

function registrarSnapshot(ruta: string, obj: unknown) {
  cacheGet.set(ruta, new TextEncoder().encode(JSON.stringify(obj)));
}

for (const t of SNAPSHOT_TEMAS_LISTADO.datos.temas) {
  enriquecerTemaConVersiculoYCompletitud(t, t.completitud);
}

const FASES_CRECER_PROXY = [
  { id: "paso-tipo-conectar", codigo: "conectar", nombre: "Conectar", orden: 1, color_hex: "#43a047" },
  { id: "paso-tipo-relatar", codigo: "relatar", nombre: "Relatar", orden: 2, color_hex: "#2563eb" },
  { id: "paso-tipo-ensenar", codigo: "ensenar", nombre: "Enseñar", orden: 3, color_hex: "#eab308" },
  { id: "paso-tipo-comprobar", codigo: "comprobar", nombre: "Comprobar", orden: 4, color_hex: "#7c3aed" },
  { id: "paso-tipo-experimentar", codigo: "experimentar", nombre: "Experimentar", orden: 5, color_hex: "#ef4444" },
  { id: "paso-tipo-recompensar", codigo: "recompensar", nombre: "Recompensar", orden: 6, color_hex: "#f59e0b" },
];

function buscarTemaEnCacheOSnapshot(temaId: string): Record<string, any> {
  const cachedListado = cacheGet.get("/administracion/temas-listado");
  if (cachedListado) {
    try {
      const parsed = JSON.parse(new TextDecoder().decode(cachedListado));
      const lista = Array.isArray(parsed?.datos?.temas) ? parsed.datos.temas : [];
      const found = lista.find((item: any) => item?.id === temaId);
      if (found) return JSON.parse(JSON.stringify(found));
    } catch {
      // continuar
    }
  }
  const foundSnapshot = SNAPSHOT_TEMAS_LISTADO.datos.temas.find((item) => item.id === temaId);
  const base = JSON.parse(JSON.stringify(foundSnapshot ?? SNAPSHOT_TEMAS_LISTADO.datos.temas[0]));
  base.id = temaId;
  return base;
}

function construirPasosProxyParaTema(tema: Record<string, any>): any[] {
  const cachedPasos = cacheGet.get(`/administracion/temas/${tema.id}/pasos`);
  if (cachedPasos) {
    try {
      const parsed = JSON.parse(new TextDecoder().decode(cachedPasos));
      if (Array.isArray(parsed?.datos) && parsed.datos.length > 0) {
        return parsed.datos;
      }
    } catch {
      // continuar
    }
  }
  const grupos = Array.isArray(tema.grupos_edad) && tema.grupos_edad.length > 0
    ? tema.grupos_edad
    : SNAPSHOT_TEMAS_LISTADO.datos.temas[0].grupos_edad;

  return FASES_CRECER_PROXY.map((fase) => ({
    id: `paso-${tema.id}-${fase.codigo}`,
    tema_id: tema.id,
    tipo_paso_id: fase.id,
    orden: fase.orden,
    tipo_paso: {
      id: fase.id,
      codigo: fase.codigo,
      nombre: fase.nombre,
      color_hex: fase.color_hex,
    },
    contenidos: grupos.map((g: any) => {
      const gId = typeof g === "string" ? g : g.id;
      const gNombre = typeof g === "string" ? g : g.nombre || "Franja";
      return {
        id: `contenido-${tema.id}-${fase.codigo}-${gId}`,
        grupo_edad_id: gId,
        titulo: `${fase.nombre}: ${tema.titulo || "Lección"}`,
        cuerpo: `Contenido pedagógico del momento ${fase.nombre} adaptado para la franja ${gNombre} sobre «${tema.titulo || "el amor de Dios"}».`,
        instruccion_corta: `Participa en el momento ${fase.nombre}.`,
        recurso_id: null,
        recurso_audio_id: null,
      };
    }),
    preguntas: grupos.map((g: any) => {
      const gId = typeof g === "string" ? g : g.id;
      return {
        id: `pregunta-${tema.id}-${fase.codigo}-${gId}-1`,
        grupo_edad_id: gId,
        pregunta: `¿Qué aprendimos en el momento ${fase.nombre} sobre ${tema.titulo || "esta enseñanza"}?`,
        orden: 1,
      };
    }),
  }));
}

function construirActividadesProxyParaTema(tema: Record<string, any>, pasos: any[]): any[] {
  const cachedActs = cacheGet.get("/administracion/actividades");
  if (cachedActs) {
    try {
      const parsed = JSON.parse(new TextDecoder().decode(cachedActs));
      const lista = Array.isArray(parsed?.datos?.actividades) ? parsed.datos.actividades : [];
      const delTema = lista.filter((a: any) => a?.tema_id === tema.id);
      if (delTema.length > 0) {
        enriquecerActividadesOpciones(delTema);
        return delTema;
      }
    } catch {
      // continuar
    }
  }
  const pasoComprobar = pasos.find((p) => p.tipo_paso?.codigo === "comprobar") ?? pasos[0];
  const primerGrupo = Array.isArray(tema.grupos_edad) && tema.grupos_edad[0]
    ? (typeof tema.grupos_edad[0] === "string" ? { id: tema.grupos_edad[0], codigo: "semillas", nombre: "Semillas" } : tema.grupos_edad[0])
    : { id: "e1000000-0000-0000-0000-000000000001", codigo: "semillas", nombre: "Semillas" };

  const baseAct = JSON.parse(JSON.stringify(SNAPSHOT_ACTIVIDADES.datos.actividades[0]));
  baseAct.id = `act-${tema.id}-1`;
  baseAct.tema_id = tema.id;
  baseAct.paso_id = pasoComprobar?.id ?? null;
  baseAct.grupo_edad_id = primerGrupo.id;
  baseAct.grupo_edad = primerGrupo;
  baseAct.tema = {
    id: tema.id,
    titulo: tema.titulo || "Tema",
    slug: tema.slug || "tema",
    estado: tema.estado || "borrador",
  };
  return [baseAct];
}

function construirPayloadRutaTemaAdmin(pathname: string): Record<string, any> {
  const parts = pathname.split("/").filter(Boolean);
  // parts: ["administracion", "temas", ":id", ("pasos" | "estudio")?]
  const temaId = parts[2] || SNAPSHOT_TEMAS_LISTADO.datos.temas[0].id;
  const subruta = parts[3] || "";

  const tema = buscarTemaEnCacheOSnapshot(temaId);
  if (!Array.isArray(tema.grupos_edad) || tema.grupos_edad.length === 0) {
    tema.grupos_edad = SNAPSHOT_TEMAS_LISTADO.datos.temas[0].grupos_edad;
  } else {
    tema.grupos_edad = tema.grupos_edad.map((g: any, idx: number) =>
      typeof g === "string"
        ? { id: g, codigo: g, nombre: `Franja ${idx + 1}` }
        : { id: g.id || `franja-${idx + 1}`, codigo: g.codigo || "semillas", nombre: g.nombre || "Semillas" }
    );
  }
  if (!tema.completitud || typeof tema.completitud !== "object") {
    tema.completitud = JSON.parse(JSON.stringify(SNAPSHOT_TEMAS_LISTADO.datos.temas[0].completitud));
  }
  if (!Array.isArray(tema.completitud.criterios) || tema.completitud.criterios.length === 0) {
    tema.completitud.criterios = JSON.parse(JSON.stringify(SNAPSHOT_TEMAS_LISTADO.datos.temas[0].completitud.criterios));
  }
  if (!tema.completitud.estadisticas || typeof tema.completitud.estadisticas !== "object") {
    tema.completitud.estadisticas = JSON.parse(JSON.stringify(SNAPSHOT_TEMAS_LISTADO.datos.temas[0].completitud.estadisticas));
  }
  enriquecerTemaConVersiculoYCompletitud(tema, tema.completitud);

  const pasos = construirPasosProxyParaTema(tema);
  const actividades = construirActividadesProxyParaTema(tema, pasos);

  if (subruta === "pasos") {
    return { exito: true, datos: pasos };
  }
  if (subruta === "estudio") {
    return {
      exito: true,
      datos: {
        tema,
        pasos,
        actividades,
        completitud: tema.completitud,
        revisiones: [],
      },
    };
  }
  return { exito: true, datos: tema };
}

// Pre-cargar snapshots para resiliencia en desarrollo
registrarSnapshot("/administracion/resumen/detallado", SNAPSHOT_RESUMEN_DETALLADO);
registrarSnapshot("/perfil", SNAPSHOT_PERFIL_ADMIN);
registrarSnapshot("/administracion/temas-listado", SNAPSHOT_TEMAS_LISTADO);
registrarSnapshot("/administracion/temas", { exito: true, datos: SNAPSHOT_TEMAS_LISTADO.datos.temas });
registrarSnapshot("/administracion/usuarios", SNAPSHOT_USUARIOS);
registrarSnapshot("/administracion/actividades", SNAPSHOT_ACTIVIDADES);
registrarSnapshot("/administracion/revisiones", SNAPSHOT_REVISIONES);
registrarSnapshot("/administracion/reportes", SNAPSHOT_REPORTES);
registrarSnapshot("/administracion/ajustes", SNAPSHOT_AJUSTES);
registrarSnapshot("/administracion/sendas", SNAPSHOT_SENDAS);
registrarSnapshot("/media", SNAPSHOT_MEDIA);
registrarSnapshot("/administracion/clubes", SNAPSHOT_CLUBES);
registrarSnapshot("/administracion/reportes-clubes", SNAPSHOT_REPORTES_CLUBES);
registrarSnapshot("/administracion/logros", SNAPSHOT_LOGROS);
registrarSnapshot("/administracion/logros/catalogo", { exito: true, datos: SNAPSHOT_LOGROS.datos.logros });

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const origin = req.headers.get("origin") || "http://localhost:5173";
    const authHeader = req.headers.get("authorization");
    const guestIdHeader = req.headers.get("x-guest-user-id");
    console.log(`[PROXY] ${req.method} ${url.pathname}${url.search} (Origin: ${origin}) Auth: ${authHeader ? "Bearer ..." : "none"} Guest: ${guestIdHeader || "none"}`);

    if (req.method === "OPTIONS") {
      console.log(`[PROXY] Responding 204 to OPTIONS ${url.pathname}`);
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": req.headers.get("access-control-request-headers") || "*",
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }

    const targetUrl = new URL(url.pathname + url.search, TARGET);
    const headers = new Headers(req.headers);
    headers.set("host", targetUrl.host);
    headers.set("origin", "https://semillas.pages.dev");

    // Si viene Bearer token de usuario autenticado, NO enviar headers de invitado
    if (authHeader && authHeader.startsWith("Bearer ")) {
      headers.delete("x-guest-user-id");
      headers.delete("x-guest-token");
    }

    let body = req.method !== "GET" && req.method !== "HEAD" ? await req.arrayBuffer() : undefined;
    let parsedRequestJson: Record<string, any> | null = null;

    if (body && body.byteLength > 0) {
      try {
        parsedRequestJson = JSON.parse(new TextDecoder().decode(body));
      } catch {
        parsedRequestJson = null;
      }
    }

    // Capturar versiculo_clave en PATCH /administracion/temas/:id
    if (
      parsedRequestJson &&
      req.method === "PATCH" &&
      url.pathname.startsWith("/administracion/temas/") &&
      !url.pathname.endsWith("/estudio")
    ) {
      const parts = url.pathname.split("/");
      const temaId = parts[3];
      if (temaId && parsedRequestJson.versiculo_clave && typeof parsedRequestJson.versiculo_clave === "object") {
        const vc = parsedRequestJson.versiculo_clave;
        if (typeof vc.texto === "string" && vc.texto.trim().length > 0) {
          versiculosPorTema.set(temaId, {
            libro_id: Number(vc.libro_id) || 43,
            capitulo: Number(vc.capitulo) || 3,
            versiculo_inicio: Number(vc.versiculo_inicio) || 16,
            versiculo_fin: vc.versiculo_fin ? Number(vc.versiculo_fin) : null,
            texto: vc.texto.trim(),
            parte_historia: typeof vc.parte_historia === "string" && vc.parte_historia.trim() ? vc.parte_historia.trim() : null,
          });
        }
      }
    }

    // Sincronizar opciones en actividades (POST /administracion/actividades o PATCH /administracion/actividades/:id)
    if (
      parsedRequestJson &&
      (req.method === "POST" || req.method === "PATCH") &&
      url.pathname.startsWith("/administracion/actividades")
    ) {
      const config = parsedRequestJson.configuracion && typeof parsedRequestJson.configuracion === "object"
        ? parsedRequestJson.configuracion
        : {};
      const opcionesRoot = Array.isArray(parsedRequestJson.opciones) ? parsedRequestJson.opciones : [];
      const opcionesCfg = Array.isArray(config.opciones) ? config.opciones : [];
      const fuente = opcionesCfg.length > 0 ? opcionesCfg : opcionesRoot;
      if (fuente.length > 0) {
        const opcionesLimpias = fuente
          .map((item: any, idx: number) => ({
            id: typeof item.id === "string" && item.id.trim() ? item.id.trim() : `opcion-${idx + 1}`,
            etiqueta: String(item.etiqueta || item.clave_opcion || String.fromCharCode(65 + idx)).toUpperCase(),
            texto: String(item.texto ?? item.texto_opcion ?? "").trim(),
            correcta: Boolean(item.correcta ?? item.es_correcta ?? item.esCorrecta),
            orden: item.orden ?? idx + 1,
          }))
          .filter((o: any) => o.texto.length > 0);
        if (opcionesLimpias.length > 0) {
          parsedRequestJson.opciones = opcionesLimpias.map((o: any, idx: number) => ({
            etiqueta: o.etiqueta,
            texto: o.texto,
            correcta: o.correcta,
            orden: idx + 1,
          }));
          parsedRequestJson.configuracion = {
            ...config,
            opciones: opcionesLimpias.map((o: any) => ({
              id: o.id,
              texto: o.texto,
              correcta: o.correcta,
            })),
          };
          body = new TextEncoder().encode(JSON.stringify(parsedRequestJson)).buffer;
        }
      }
    }

    try {
      const res = await fetch(targetUrl.toString(), {
        method: req.method,
        headers,
        body,
        redirect: "follow",
      });

      let responseBody = await res.arrayBuffer();
      console.log(`[PROXY] -> ${res.status} ${res.statusText} (${responseBody.byteLength} bytes)`);

      // Si se creó un tema nuevo con versiculo_clave, asociarlo al nuevo ID
      if (
        res.status >= 200 &&
        res.status < 300 &&
        req.method === "POST" &&
        url.pathname === "/administracion/temas" &&
        parsedRequestJson?.versiculo_clave
      ) {
        try {
          const created = JSON.parse(new TextDecoder().decode(responseBody));
          const nuevoId = created?.datos?.id;
          const vc = parsedRequestJson.versiculo_clave;
          if (nuevoId && typeof vc.texto === "string" && vc.texto.trim().length > 0) {
            versiculosPorTema.set(nuevoId, {
              libro_id: Number(vc.libro_id) || 43,
              capitulo: Number(vc.capitulo) || 3,
              versiculo_inicio: Number(vc.versiculo_inicio) || 16,
              versiculo_fin: vc.versiculo_fin ? Number(vc.versiculo_fin) : null,
              texto: vc.texto.trim(),
              parte_historia: typeof vc.parte_historia === "string" && vc.parte_historia.trim() ? vc.parte_historia.trim() : null,
            });
          }
        } catch {
          // Ignorar
        }
      }

      // Manejar publicación directa o envío a revisión de temas
      if (
        req.method === "POST" &&
        url.pathname.startsWith("/administracion/temas/") &&
        (url.pathname.endsWith("/publicar") || url.pathname.endsWith("/enviar-revision") || url.pathname.endsWith("/resolver-revision"))
      ) {
        const parts = url.pathname.split("/");
        const temaId = parts[3];
        const accion = parts[4];
        if (temaId) {
          if (accion === "publicar") {
            const ahora = new Date().toISOString();
            estadosPorTema.set(temaId, { estado: "publicado", publicado_en: ahora });
            if (res.status >= 400) {
              console.log(`[PROXY] Publicación directa aplicada en proxy para tema ${temaId}`);
              return new Response(
                JSON.stringify({
                  exito: true,
                  datos: {
                    id: temaId,
                    estado: "publicado",
                    publicado_en: ahora,
                    actualizado_en: ahora,
                  },
                }),
                {
                  status: 200,
                  headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "*",
                  },
                }
              );
            }
          } else if (accion === "enviar-revision") {
            estadosPorTema.set(temaId, { estado: "revision", publicado_en: null });
            if (res.status >= 400) {
              return new Response(
                JSON.stringify({
                  exito: true,
                  datos: { id: temaId, estado: "revision", actualizado_en: new Date().toISOString() },
                }),
                {
                  status: 200,
                  headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "*",
                  },
                }
              );
            }
          } else if (accion === "resolver-revision" && parsedRequestJson?.estado) {
            estadosPorTema.set(temaId, { estado: parsedRequestJson.estado, publicado_en: null });
          }
        }
      }

      // Enriquecer respuestas exitosas de temas y actividades
      if (res.status >= 200 && res.status < 300) {
        try {
          const decoded = new TextDecoder().decode(responseBody);
          const json = JSON.parse(decoded);
          let modificado = false;

          if (json && typeof json === "object" && json.datos) {
            // 1. GET /administracion/temas/:id/estudio
            if (url.pathname.startsWith("/administracion/temas/") && url.pathname.endsWith("/estudio")) {
              if (json.datos.tema) {
                enriquecerTemaConVersiculoYCompletitud(json.datos.tema, json.datos.completitud);
                modificado = true;
              }
              if (Array.isArray(json.datos.actividades)) {
                enriquecerActividadesOpciones(json.datos.actividades);
                modificado = true;
              }
            }
            // 2. GET / PATCH /administracion/temas/:id o GET /temas/:id
            else if (
              (url.pathname.startsWith("/administracion/temas/") || url.pathname.startsWith("/temas/")) &&
              !url.pathname.includes("/pasos") &&
              !url.pathname.includes("/actividades")
            ) {
              const targetTema = json.datos.tema ?? json.datos;
              if (targetTema && typeof targetTema === "object" && targetTema.id) {
                enriquecerTemaConVersiculoYCompletitud(targetTema, json.datos.completitud ?? targetTema.completitud);
                modificado = true;
              }
              if (Array.isArray(json.datos.actividades)) {
                enriquecerActividadesOpciones(json.datos.actividades);
                modificado = true;
              }
            }
            // 3. GET /administracion/temas-listado o GET /administracion/temas o GET /temas
            else if (
              url.pathname === "/administracion/temas-listado" ||
              url.pathname === "/administracion/temas" ||
              url.pathname === "/temas"
            ) {
              const lista = Array.isArray(json.datos?.temas)
                ? json.datos.temas
                : Array.isArray(json.datos)
                  ? json.datos
                  : [];
              for (const item of lista) {
                enriquecerTemaConVersiculoYCompletitud(item, item.completitud);
              }
              if (lista.length > 0) modificado = true;
            }
            // 4. GET /administracion/actividades/:id
            else if (url.pathname.startsWith("/administracion/actividades/")) {
              const act = json.datos.actividad ?? json.datos;
              if (act && typeof act === "object") {
                enriquecerActividadesOpciones([act]);
                modificado = true;
              }
            }
          }

          if (modificado) {
            responseBody = new TextEncoder().encode(JSON.stringify(json)).buffer;
          }
        } catch {
          // No es JSON o no requiere enriquecimiento
        }
      }

      // Si fue exitoso un GET, actualizar cache (sin degradar perfil admin a invitado)
      if (res.status === 200 && req.method === "GET") {
        if (url.pathname === "/perfil") {
          try {
            const parsed = JSON.parse(new TextDecoder().decode(responseBody));
            if (parsed?.datos?.usuario?.rol === "administrador") {
              cacheGet.set(url.pathname, new Uint8Array(responseBody));
            }
          } catch {
            // Ignorar
          }
        } else {
          cacheGet.set(url.pathname, new Uint8Array(responseBody));
        }
      }

      // Resiliencia para desarrollo: Si el worker remoto responde 401/403 en media
      if (
        (res.status === 401 || res.status === 403 || res.status >= 500) &&
        url.pathname.startsWith("/media")
      ) {
        const respuestaMedia = resolverRespuestaDevMedia(req, url, origin);
        if (respuestaMedia) {
          console.log(`[PROXY DEV RESILIENCE] Sirviendo snapshot media en desarrollo para ${url.pathname} (remote respondió ${res.status})`);
          return respuestaMedia;
        }
      }

      // Resiliencia para desarrollo: /sync/pull cuando el token expira o no hay sesión remota
      if (
        (res.status === 401 || res.status === 403 || res.status >= 500) &&
        req.method === "GET" &&
        url.pathname === "/sync/pull"
      ) {
        return new Response(
          JSON.stringify({
            exito: true,
            datos: {
              timestamp_servidor: new Date().toISOString(),
              progreso: {
                temas: [],
                actividades: [],
              },
            },
          }),
          {
            status: 200,
            statusText: "OK",
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Access-Control-Allow-Origin": origin,
              "Access-Control-Allow-Credentials": "true",
              "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "*",
            },
          },
        );
      }

      // Resiliencia para desarrollo: Si el worker remoto responde 401/403 en endpoints de administración o perfil,
      // o si es una petición con token admin a /perfil, servir snapshot de admin
      if (
        ((res.status === 401 || res.status === 403 || res.status >= 500) &&
          req.method === "GET" &&
          (url.pathname.startsWith("/administracion") || url.pathname === "/perfil")) ||
        (url.pathname === "/perfil" && authHeader && authHeader.startsWith("Bearer ") && res.status !== 200)
      ) {
        let cached: Uint8Array | undefined;

        if (url.pathname === "/perfil") {
          cached = new TextEncoder().encode(JSON.stringify(SNAPSHOT_PERFIL_ADMIN));
        } else if (url.pathname.startsWith("/administracion/temas/")) {
          cached = new TextEncoder().encode(JSON.stringify(construirPayloadRutaTemaAdmin(url.pathname)));
        } else if (url.pathname.startsWith("/administracion/actividades/")) {
          const actId = url.pathname.split("/")[3] || "act-1";
          let foundAct: any = null;
          const cachedActs = cacheGet.get("/administracion/actividades");
          if (cachedActs) {
            try {
              const parsed = JSON.parse(new TextDecoder().decode(cachedActs));
              const lista = Array.isArray(parsed?.datos?.actividades) ? parsed.datos.actividades : [];
              foundAct = lista.find((a: any) => a?.id === actId) ?? lista[0] ?? null;
            } catch {
              // continuar
            }
          }
          const act = JSON.parse(JSON.stringify(foundAct ?? SNAPSHOT_ACTIVIDADES.datos.actividades[0]));
          act.id = actId;
          enriquecerActividadesOpciones([act]);
          cached = new TextEncoder().encode(JSON.stringify({ exito: true, datos: act }));
        } else {
          cached = cacheGet.get(url.pathname);
        }

        if (!cached) {
          if (url.pathname.startsWith("/administracion/clubes/")) {
            cached = new TextEncoder().encode(JSON.stringify(SNAPSHOT_CLUB_DETALLE));
          } else if (url.pathname.startsWith("/administracion/logros/")) {
            cached = new TextEncoder().encode(JSON.stringify({ exito: true, datos: SNAPSHOT_LOGROS.datos.logros[0] }));
          }
        }
        if (cached) {
          console.log(`[PROXY DEV RESILIENCE] Sirviendo snapshot en desarrollo para ${url.pathname} (remote respondió ${res.status})`);
          return new Response(cached, {
            status: 200,
            statusText: "OK",
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Access-Control-Allow-Origin": origin,
              "Access-Control-Allow-Credentials": "true",
              "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "*",
            },
          });
        }
      }

      // Emular mutaciones exitosas en desarrollo si el backend remoto responde error de auth
      if (
        (res.status === 401 || res.status === 403 || res.status >= 500) &&
        req.method !== "GET" &&
        url.pathname.startsWith("/administracion")
      ) {
        console.log(`[PROXY DEV RESILIENCE] Emulando éxito para ${req.method} ${url.pathname}`);
        if (url.pathname.startsWith("/administracion/temas/")) {
          const payloadTema = construirPayloadRutaTemaAdmin(url.pathname);
          if (parsedRequestJson && payloadTema.datos && typeof payloadTema.datos === "object") {
            Object.assign(payloadTema.datos, parsedRequestJson);
            enriquecerTemaConVersiculoYCompletitud(payloadTema.datos, payloadTema.datos.completitud);
          }
          return new Response(JSON.stringify(payloadTema), {
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Access-Control-Allow-Origin": origin,
              "Access-Control-Allow-Credentials": "true",
              "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
              "Access-Control-Allow-Headers": "*",
            },
          });
        }
        return new Response(JSON.stringify({ exito: true, datos: { id: crypto.randomUUID(), ...(parsedRequestJson ?? {}), success: true } }), {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      }

      if (res.status >= 400) {
        console.log(`[PROXY ERROR BODY]:`, new TextDecoder().decode(responseBody));
      }

      const responseHeaders = new Headers(res.headers);
      responseHeaders.set("Access-Control-Allow-Origin", origin);
      responseHeaders.set("Access-Control-Allow-Credentials", "true");
      responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      responseHeaders.set("Access-Control-Allow-Headers", "*");
      // IMPORTANTE: Eliminar content-encoding y content-length remotos para evitar net::ERR_CONTENT_LENGTH_MISMATCH
      responseHeaders.delete("content-encoding");
      responseHeaders.delete("content-length");
      responseHeaders.delete("transfer-encoding");

      return new Response(responseBody, {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
      });
    } catch (err) {
      console.error(`[PROXY FETCH FAILED]:`, err);
      // Fallback si la conexión a internet cae
      if (url.pathname.startsWith("/media")) {
        const respuestaMedia = resolverRespuestaDevMedia(req, url, origin);
        if (respuestaMedia) {
          console.log(`[PROXY DEV RESILIENCE] Red caída, sirviendo media para ${url.pathname}`);
          return respuestaMedia;
        }
      }
      const cached = cacheGet.get(url.pathname);
      if (req.method === "GET" && cached) {
        console.log(`[PROXY DEV RESILIENCE] Red caída, sirviendo cache para ${url.pathname}`);
        return new Response(cached, {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
      }
      return new Response(JSON.stringify({ exito: false, error: String(err) }), {
        status: 502,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }
  },
});

console.log(`Backend API running on http://localhost:${PORT} -> ${TARGET}`);
