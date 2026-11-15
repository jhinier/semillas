import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TARGET = "https://api-semillas.andresalexander14.workers.dev";
const PORT = 8787;
const DEV_STATE_FILE = join(tmpdir(), "semillas-dev-proxy-state-v2.json");

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

const CATALOGO_SENDAS_PROXY = [
  {
    id: "e7fd69e0-c8a4-4dba-b5d0-cc85bb03bc22",
    codigo: "padre",
    nombre: "Senda del Padre",
    color_hex: "#3D8BD4",
    color: "#3D8BD4",
    descripcion: "Conociendo el amor y la fidelidad del Padre",
  },
  {
    id: "aafc97f6-b702-43f6-9231-1044b51ed88a",
    codigo: "hijo",
    nombre: "Senda del Hijo",
    color_hex: "#6D35E8",
    color: "#6D35E8",
    descripcion: "Siguiendo los pasos y enseñanzas de Jesús",
  },
  {
    id: "43155250-0380-41cc-9a6b-6cb4325638af",
    codigo: "espiritu",
    nombre: "Senda del Espíritu Santo",
    color_hex: "#F97316",
    color: "#F97316",
    descripcion: "Viviendo en el fruto y poder del Espíritu Santo",
  },
];

const CATALOGO_GRUPOS_EDAD_PROXY = [
  { id: "b7bb9917-0a56-4adf-8b7d-bd8ad1a3a6a2", codigo: "semillas", nombre: "Semillas", edad_min: 5, edad_max: 8, edad_minima: 5, edad_maxima: 8 },
  { id: "4afa01e2-96c1-4055-b88a-adc4f0303165", codigo: "exploradores", nombre: "Exploradores", edad_min: 9, edad_max: 12, edad_minima: 9, edad_maxima: 12 },
  { id: "4a69e67c-4fd3-4263-8f30-58416f323870", codigo: "embajadores", nombre: "Embajadores", edad_min: 13, edad_max: 17, edad_minima: 13, edad_maxima: 17 },
];

const CATALOGO_TIPOS_ACTIVIDAD_PROXY = [
  { id: "6952ae4b-1a03-48d4-8ed2-f3bd1669e9f8", codigo: "actividad_audio", nombre: "Actividad de Audio" },
  { id: "3f241547-ec26-42bf-b8da-95b79f5e599e", codigo: "actividad_video", nombre: "Actividad de Video" },
  { id: "14f3e7b4-53e9-4f10-aea1-368fe0eab7dc", codigo: "arrastrar_soltar", nombre: "Arrastrar y Soltar" },
  { id: "c43aa274-b388-4f8a-9a6b-72f03fa1197b", codigo: "aventura_decisiones", nombre: "Aventura de Decisiones" },
  { id: "a5a68697-20a9-4e3b-a137-564876b47566", codigo: "cancion", nombre: "Canción y Alabanza" },
  { id: "da8ef3b5-97db-4da4-aa36-3055c56f36c9", codigo: "completar_versiculo", nombre: "Completar Versículo" },
  { id: "a26528fd-620e-40b2-9f66-c6b87d4f1034", codigo: "tarjetas_memoria", nombre: "Tarjetas de Memoria" },
  { id: "fa752291-09f8-46bd-acc7-e85117a5861b", codigo: "manualidad", nombre: "Manualidad" },
  { id: "dc3c502a-ed2a-4a4c-ba57-53bc2b5258a4", codigo: "cuestionario", nombre: "Cuestionario (Quiz)" },
  { id: "4d9fb7d5-0e10-4dd0-8e0b-a1d7b5b1040a", codigo: "relacionar_pares", nombre: "Relacionar Pares" },
  { id: "70cc06c0-1c89-48f7-943e-375498ebc1b0", codigo: "rompecabezas", nombre: "Rompecabezas" },
  { id: "a54115f5-e829-44d4-9cab-8f4d00434f6c", nombre: "sopa_letras", nombre: "Sopa de Letras" },
  { id: "e9aceb4c-da06-49fa-9b18-d530218d266a", codigo: "verdadero_falso", nombre: "Verdadero o Falso" },
];

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
    grupos_edad: CATALOGO_GRUPOS_EDAD_PROXY.map((g) => ({ ...g })),
  },
};

function buscarSendaProxy(sendaNombreOId?: string | null) {
  const valor = String(sendaNombreOId || "").toLowerCase();
  const encontrada =
    CATALOGO_SENDAS_PROXY.find((s) => s.id === sendaNombreOId || s.codigo === valor || s.nombre.toLowerCase() === valor) ??
    CATALOGO_SENDAS_PROXY.find((s) => valor.includes(s.codigo)) ??
    CATALOGO_SENDAS_PROXY[0];
  return { id: encontrada.id, codigo: encontrada.codigo, nombre: encontrada.nombre, color_hex: encontrada.color_hex };
}

const SNAPSHOT_TEMAS_LISTADO = {
  exito: true,
  datos: {
    temas: SNAPSHOT_RESUMEN_DETALLADO.datos.temas_recientes.map((t) => {
      const sendaObj = buscarSendaProxy(t.senda);
      return {
        ...t,
        slug: t.titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        resumen: "Contenido temático de " + t.titulo,
        objetivo: "Comprender y vivir la enseñanza bíblica de " + t.titulo,
        version_contenido: 1,
        version_biblica_id: "rvr60",
        minutos_estimados: 15,
        xp_recompensa: 50,
        publicado_en: t.estado === "publicado" ? t.actualizado_en : null,
        es_destacado: false,
        senda_id: sendaObj.id,
        senda: sendaObj,
        portada_recurso_id: "00000000-0000-0000-0000-000000000001",
        portada_id: "00000000-0000-0000-0000-000000000001",
        portada: {
          id: "00000000-0000-0000-0000-000000000001",
          url: "/src/assets/images/Ilustraciones/Semilla.webp",
          url_publica: "/src/assets/images/Ilustraciones/Semilla.webp",
          titulo: "Semilla y brote inicial",
        },
        grupos_edad: CATALOGO_GRUPOS_EDAD_PROXY.map((g) => ({ id: g.id, codigo: g.codigo, nombre: g.nombre })),
        completitud: {
          porcentaje: t.estado === "publicado" ? 100 : 71,
          listo_para_revision: t.estado === "publicado",
          bloqueos: t.estado === "publicado" ? [] : ["Completa los momentos CRECER o actividades pendientes antes de publicar"],
          criterios: [
            { codigo: "ficha_base", etiqueta: "Datos básicos y versículo", completo: true, detalle: "" },
            { codigo: "portada", etiqueta: "Portada asignada", completo: true, detalle: "" },
            { codigo: "grupos_edad", etiqueta: "Franjas de edad", completo: true, detalle: "" },
            { codigo: "pasos_crecer", etiqueta: "6 momentos CRECER", completo: true, detalle: "" },
            { codigo: "contenido_crecer", etiqueta: "Contenido por franja", completo: t.estado === "publicado", detalle: t.estado === "publicado" ? "" : "Falta revisar el contenido por franja" },
            { codigo: "actividades", etiqueta: "Actividades configuradas", completo: t.estado === "publicado", detalle: t.estado === "publicado" ? "" : "Agrega al menos 1 actividad" },
            { codigo: "publicacion", etiqueta: "Listo para publicar", completo: t.estado === "publicado", detalle: t.estado === "publicado" ? "" : "Completa los pasos anteriores" },
          ],
          estadisticas: {
            grupos_edad: 3,
            pasos_totales: 6,
            pasos_creados: 6,
            contenidos_creados: t.estado === "publicado" ? 18 : 6,
            contenidos_esperados: 18,
            actividades: t.estado === "publicado" ? 1 : 0,
          },
        },
      };
    }),
    total: 6,
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
        nombre: "Primer paso",
        titulo: "Primer paso",
        descripcion: "Completa tu primer tema bíblico completo.",
        criterio: "Requisito: Completa tu primer tema bíblico",
        codigo_criterio: "temas_completados",
        valor_criterio: 1,
        bono_xp: 20,
        xp_recompensa: 20,
        url_icono: "/src/assets/images/Ilustraciones/Versiculo del dia.webp",
        icono_url: "/src/assets/images/Ilustraciones/Versiculo del dia.webp",
        activo: true,
        creado_en: "2026-08-01T10:00:00Z",
        actualizado_en: "2026-08-01T10:00:00Z",
        otorgados: 14,
        otorgados_count: 14,
      },
      {
        id: "l1000000-0000-0000-0000-000000000002",
        codigo: "amor_de_dios",
        nombre: "El Amor de Dios",
        titulo: "El Amor de Dios",
        descripcion: "Completa el tema El Amor de Dios.",
        criterio: "Requisito: Completa el tema «El Amor de Dios»",
        codigo_criterio: "actividades_completadas",
        valor_criterio: 3,
        bono_xp: 25,
        xp_recompensa: 25,
        url_icono: "/src/assets/images/Ilustraciones/Versiculo del dia.webp",
        icono_url: "/src/assets/images/Ilustraciones/Versiculo del dia.webp",
        activo: true,
        creado_en: "2026-08-02T10:00:00Z",
        actualizado_en: "2026-08-02T10:00:00Z",
        otorgados: 9,
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
        nombre_visible: "Administrador",
        correo: "admin@correo.com",
        rol: "administrador",
        apodo: "Administrador",
        proveedor: "correo",
        activo: true,
        estado: "activo",
        creado_en: "2026-07-01T00:00:00Z",
        actualizado_en: "2026-10-30T17:00:00Z",
        ultimo_acceso: "2026-10-30T17:00:00Z",
        ultimo_login_en: "2026-10-30T17:00:00Z",
        perfil: {
          id: "perfil-admin-1",
          apodo: "Administrador",
          avatar_url: null,
          clave_avatar: null,
          grupo_edad_id: "e1000000-0000-0000-0000-000000000001",
          prefiere_audio: true,
          tamano_texto_preferido: "mediano",
        },
        grupo_edad: {
          id: "e1000000-0000-0000-0000-000000000001",
          codigo: "semillas",
          nombre: "Semillas",
          edad_minima: 6,
          edad_maxima: 8,
        },
        clubes: [
          {
            id: "c1000000-0000-0000-0000-000000000001",
            nombre: "Semillas Quito Norte",
            rol_miembro: "lider",
            unido_en: "2026-09-01T10:00:00Z",
          },
        ],
        vinculos_familiares: 1,
        progreso: {
          xp_total: 420,
          eventos: 18,
        },
      },
      {
        id: "u1000000-0000-0000-0000-000000000002",
        nombre_visible: "Mateo Estudiante",
        correo: "mateo@semillas.ec",
        rol: "usuario",
        apodo: "Mateo",
        proveedor: "correo",
        activo: true,
        estado: "activo",
        creado_en: "2026-08-15T10:00:00Z",
        actualizado_en: "2026-10-29T15:00:00Z",
        ultimo_acceso: "2026-10-29T15:00:00Z",
        ultimo_login_en: "2026-10-29T15:00:00Z",
        perfil: {
          id: "perfil-user-2",
          apodo: "Mateo",
          avatar_url: null,
          clave_avatar: null,
          grupo_edad_id: "e1000000-0000-0000-0000-000000000002",
          prefiere_audio: false,
          tamano_texto_preferido: "mediano",
        },
        grupo_edad: {
          id: "e1000000-0000-0000-0000-000000000002",
          codigo: "brotes",
          nombre: "Brotes",
          edad_minima: 9,
          edad_maxima: 11,
        },
        clubes: [
          {
            id: "c1000000-0000-0000-0000-000000000001",
            nombre: "Semillas Quito Norte",
            rol_miembro: "miembro",
            unido_en: "2026-09-05T10:00:00Z",
          },
        ],
        vinculos_familiares: 1,
        progreso: {
          xp_total: 280,
          eventos: 12,
        },
      },
    ],
    total: 2,
    limit: 20,
    offset: 0,
    resumen: {
      total: 2,
      activos: 2,
      pendientes: 0,
      bloqueados: 0,
      administradores: 1,
      padres: 0,
    },
    catalogos: {
      grupos_edad: [
        { id: "e1000000-0000-0000-0000-000000000001", codigo: "semillas", nombre: "Semillas", edad_minima: 6, edad_maxima: 8 },
        { id: "e1000000-0000-0000-0000-000000000002", codigo: "brotes", nombre: "Brotes", edad_minima: 9, edad_maxima: 11 },
        { id: "e1000000-0000-0000-0000-000000000003", codigo: "raices", nombre: "Raíces", edad_minima: 12, edad_maxima: 14 },
      ],
      clubes: [
        { id: "c1000000-0000-0000-0000-000000000001", nombre: "Semillas Quito Norte", activo: true },
      ],
      tutores: [
        { id: "aff4c70c-086c-43f3-8501-b55bb13807b2", nombre_visible: "Administrador", correo: "admin@correo.com" },
      ],
    },
  },
};

const SNAPSHOT_ACTIVIDADES = {
  exito: true,
  datos: {
    actividades: [
      {
        id: "act-1",
        tema_id: "47a2e22f-86da-466f-92ff-1847d85de609",
        paso_id: "paso-47a2e22f-86da-466f-92ff-1847d85de609-comprobar",
        grupo_edad_id: "b7bb9917-0a56-4adf-8b7d-bd8ad1a3a6a2",
        tipo_actividad_id: "dc3c502a-ed2a-4a4c-ba57-53bc2b5258a4",
        titulo: "Quiz Bíblico",
        consigna: "Responde la pregunta sobre la enseñanza bíblica.",
        retroalimentacion: "¡Muy bien! Recordaste la enseñanza.",
        dificultad: "normal",
        xp_recompensa: 20,
        limite_tiempo_seg: null,
        orden: 1,
        obligatorio: true,
        estado: "publicada",
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
          id: "dc3c502a-ed2a-4a4c-ba57-53bc2b5258a4",
          codigo: "cuestionario",
          nombre: "Cuestionario (Quiz)",
        },
        tema: {
          id: "47a2e22f-86da-466f-92ff-1847d85de609",
          titulo: "El Amor de Dios",
          slug: "el-amor-de-dios",
          estado: "publicado",
          senda: {
            id: "e7fd69e0-c8a4-4dba-b5d0-cc85bb03bc22",
            codigo: "padre",
            nombre: "Senda del Padre",
            color_hex: "#3D8BD4",
          },
        },
        grupo_edad: {
          id: "b7bb9917-0a56-4adf-8b7d-bd8ad1a3a6a2",
          codigo: "semillas",
          nombre: "Semillas",
        },
      },
    ],
    total: 1,
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
    id: "ajustes-1",
    nombre_plataforma: "Semillas",
    correo_soporte: "admin@correo.com",
    zona_horaria: "America/Guayaquil",
    notas_obligatorias_cambios: false,
    notas_obligatorias_rechazo: true,
    creado_en: "2026-07-01T00:00:00Z",
    actualizado_en: "2026-10-30T17:00:00Z",
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
  datos: CATALOGO_SENDAS_PROXY.map((s) => ({ ...s })),
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

    // Sincronizar estado y metadata de tema con el tema actual en devStore
    const temaActual = act.tema_id ? devStore.temas.find((t: any) => t?.id === act.tema_id) : undefined;
    if (temaActual) {
      recalcularCompletitudTemaDev(temaActual);
      act.tema = {
        ...(act.tema ?? {}),
        id: temaActual.id,
        titulo: temaActual.titulo,
        slug: temaActual.slug,
        estado: temaActual.estado,
        senda: temaActual.senda ?? act.tema?.senda,
      };
      act.estado =
        temaActual.estado === "publicado"
          ? "publicada"
          : temaActual.estado === "revision"
            ? "revision"
            : "borrador";
    } else if (act.estado !== "publicada" && act.estado !== "revision") {
      act.estado =
        act.tema?.estado === "publicado"
          ? "publicada"
          : act.tema?.estado === "revision"
            ? "revision"
            : "borrador";
    }

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
  { id: "e88e4080-9c00-407c-9866-2cc744fbba0b", codigo: "conectar", nombre: "Conectar", orden: 1, color_hex: "#22A447" },
  { id: "16bbc3aa-ca56-493e-a986-62e79d1963c6", codigo: "relatar", nombre: "Relatar", orden: 2, color_hex: "#2F80ED" },
  { id: "94130d23-0e39-4345-97fc-8ac21a1bdc62", codigo: "ensenar", nombre: "Enseñar", orden: 3, color_hex: "#6D35E8" },
  { id: "c2b51e33-b8f2-4154-bac2-c2dd5b62f4c6", codigo: "comprobar", nombre: "Comprobar", orden: 4, color_hex: "#F97316" },
  { id: "35afdbd1-d0f0-4c51-aa88-ea624b070c91", codigo: "experimentar", nombre: "Experimentar", orden: 5, color_hex: "#06B6D4" },
  { id: "236f9dde-65c3-4007-8aa4-20bf22f9cc38", codigo: "recompensar", nombre: "Recompensar", orden: 6, color_hex: "#FFC83D" },
];

type DevProxyStore = {
  temas: Record<string, any>[];
  pasosPorTema: Record<string, any[]>;
  actividades: Record<string, any>[];
  revisiones: Record<string, any>[];
  clubes: Record<string, any>[];
  clubDetalles: Record<string, Record<string, any>>;
  logros: Record<string, any>[];
  usuarios: Record<string, any>[];
  reportesClubes: Record<string, any>[];
  ajustes: Record<string, any>;
};

function normalizarSlugProxy(texto: string): string {
  const clean = String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return clean || `tema-${Date.now()}`;
}

function crearPasosBaseParaTema(tema: Record<string, any>, prefillsCompletos: boolean): any[] {
  const grupos = Array.isArray(tema.grupos_edad) && tema.grupos_edad.length > 0
    ? tema.grupos_edad
    : CATALOGO_GRUPOS_EDAD_PROXY.slice(0, 1);

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
    contenidos: prefillsCompletos
      ? grupos.map((g: any) => {
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
        })
      : [],
    preguntas: prefillsCompletos
      ? grupos.map((g: any) => {
          const gId = typeof g === "string" ? g : g.id;
          return {
            id: `pregunta-${tema.id}-${fase.codigo}-${gId}-1`,
            grupo_edad_id: gId,
            pregunta: `¿Qué aprendimos en el momento ${fase.nombre} sobre ${tema.titulo || "esta enseñanza"}?`,
            orden: 1,
          };
        })
      : [],
  }));
}

function construirClubDetalleBase(club: Record<string, any>): Record<string, any> {
  const baseDetalle = JSON.parse(JSON.stringify(SNAPSHOT_CLUB_DETALLE.datos));
  return {
    club: {
      id: club.id,
      nombre: club.nombre,
      descripcion: club.descripcion ?? null,
      codigo_invitacion: `SEM${String(club.id || "1234").slice(0, 6).toUpperCase()}`,
      activo: club.activo !== false,
      creado_en: club.creado_en || new Date().toISOString(),
    },
    miembros: club.id === SNAPSHOT_CLUB_DETALLE.datos.club.id ? baseDetalle.miembros : [],
    retos: club.id === SNAPSHOT_CLUB_DETALLE.datos.club.id ? baseDetalle.retos : [],
  };
}

function inicializarDevStoreDesdeSnapshots(): DevProxyStore {
  const temas = JSON.parse(JSON.stringify(SNAPSHOT_TEMAS_LISTADO.datos.temas)) as Record<string, any>[];
  const pasosPorTema: Record<string, any[]> = {};
  for (const t of temas) {
    pasosPorTema[t.id] = crearPasosBaseParaTema(t, t.estado === "publicado");
  }
  const actividades = JSON.parse(JSON.stringify(SNAPSHOT_ACTIVIDADES.datos.actividades)) as Record<string, any>[];
  const revisiones = JSON.parse(JSON.stringify(SNAPSHOT_REVISIONES.datos.revisiones || [])) as Record<string, any>[];
  const clubes = JSON.parse(JSON.stringify(SNAPSHOT_CLUBES.datos.clubes || [])) as Record<string, any>[];
  const clubDetalles: Record<string, Record<string, any>> = {};
  for (const c of clubes) {
    clubDetalles[c.id] = construirClubDetalleBase(c);
  }
  const logros = JSON.parse(JSON.stringify(SNAPSHOT_LOGROS.datos.logros || [])) as Record<string, any>[];
  const usuarios = JSON.parse(JSON.stringify(SNAPSHOT_USUARIOS.datos.usuarios || [])) as Record<string, any>[];
  const reportesClubes = JSON.parse(JSON.stringify(SNAPSHOT_REPORTES_CLUBES.datos || [])) as Record<string, any>[];
  const ajustes = JSON.parse(JSON.stringify(SNAPSHOT_AJUSTES.datos)) as Record<string, any>;
  const initial: DevProxyStore = {
    temas,
    pasosPorTema,
    actividades,
    revisiones,
    clubes,
    clubDetalles,
    logros,
    usuarios,
    reportesClubes,
    ajustes,
  };
  return initial;
}

function cargarDevStore(): DevProxyStore {
  try {
    if (existsSync(DEV_STATE_FILE)) {
      const raw = JSON.parse(readFileSync(DEV_STATE_FILE, "utf8"));
      if (raw && Array.isArray(raw.temas) && raw.pasosPorTema && Array.isArray(raw.actividades)) {
        const clubes = Array.isArray(raw.clubes)
          ? raw.clubes
          : JSON.parse(JSON.stringify(SNAPSHOT_CLUBES.datos.clubes || []));
        const clubDetalles: Record<string, Record<string, any>> =
          raw.clubDetalles && typeof raw.clubDetalles === "object" ? raw.clubDetalles : {};
        for (const c of clubes) {
          if (!clubDetalles[c.id]) {
            clubDetalles[c.id] = construirClubDetalleBase(c);
          }
        }
        return {
          temas: raw.temas,
          pasosPorTema: raw.pasosPorTema,
          actividades: raw.actividades,
          revisiones: Array.isArray(raw.revisiones) ? raw.revisiones : [],
          clubes,
          clubDetalles,
          logros: Array.isArray(raw.logros)
            ? raw.logros
            : JSON.parse(JSON.stringify(SNAPSHOT_LOGROS.datos.logros || [])),
          usuarios: Array.isArray(raw.usuarios)
            ? raw.usuarios
            : JSON.parse(JSON.stringify(SNAPSHOT_USUARIOS.datos.usuarios || [])),
          reportesClubes: Array.isArray(raw.reportesClubes)
            ? raw.reportesClubes
            : JSON.parse(JSON.stringify(SNAPSHOT_REPORTES_CLUBES.datos || [])),
          ajustes:
            raw.ajustes && typeof raw.ajustes === "object"
              ? raw.ajustes
              : JSON.parse(JSON.stringify(SNAPSHOT_AJUSTES.datos)),
        };
      }
    }
  } catch {
    // Usar snapshots si el archivo temporal estuviera corrupto
  }
  return inicializarDevStoreDesdeSnapshots();
}

const devStore: DevProxyStore = cargarDevStore();

function guardarDevStoreEnDisco() {
  try {
    writeFileSync(DEV_STATE_FILE, JSON.stringify(devStore, null, 2), "utf8");
  } catch {
    // No bloquear ejecución si el disco temporal no permite escritura
  }
}

function resolverGruposEdadProxy(ids?: unknown[]): any[] {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const resueltos = ids
    .map((id) => {
      const idStr = typeof id === "string" ? id : String((id as any)?.id || "");
      return (
        CATALOGO_GRUPOS_EDAD_PROXY.find((g) => g.id === idStr || g.codigo === idStr) ??
        (typeof id === "object" && id !== null ? id : null)
      );
    })
    .filter(Boolean);
  return resueltos.map((g: any) => ({ id: g.id, codigo: g.codigo, nombre: g.nombre }));
}

function resolverPortadaProxy(portadaRecursoId?: string | null, existingPortada?: any) {
  if (portadaRecursoId) {
    const recurso = SNAPSHOT_MEDIA.datos.find((m) => m.id === portadaRecursoId);
    if (recurso) {
      return {
        id: recurso.id,
        url: recurso.url_publica,
        url_publica: recurso.url_publica,
        titulo: recurso.titulo,
      };
    }
    return {
      id: portadaRecursoId,
      url: "/src/assets/images/Ilustraciones/Semilla.webp",
      url_publica: "/src/assets/images/Ilustraciones/Semilla.webp",
      titulo: "Portada seleccionada",
    };
  }
  return existingPortada ?? null;
}

function recalcularCompletitudTemaDev(tema: Record<string, any>) {
  const grupos = Array.isArray(tema.grupos_edad) ? tema.grupos_edad : [];
  const pasos = devStore.pasosPorTema[tema.id] ?? [];
  const actividades = devStore.actividades.filter((a) => a.tema_id === tema.id && a.estado !== "archivado");

  if (!Array.isArray(tema.pasos_crecer)) {
    tema.pasos_crecer = pasos;
  }

  enriquecerTemaConVersiculoYCompletitud(tema, null);

  const tieneTitulo = typeof tema.titulo === "string" && tema.titulo.trim().length >= 3;
  const tieneResumenUObjetivo =
    (typeof tema.resumen === "string" && tema.resumen.trim().length >= 3) ||
    (typeof tema.objetivo === "string" && tema.objetivo.trim().length >= 3);
  const tieneVersiculo = Boolean(
    (tema.versiculo_clave?.texto && String(tema.versiculo_clave.texto).trim().length > 0) ||
    (tema.referencia_biblica?.texto && String(tema.referencia_biblica.texto).trim().length > 0),
  );
  const fichaBaseCompleta = Boolean(tieneTitulo && tieneResumenUObjetivo && tieneVersiculo);
  const portadaCompleta = Boolean(tema.portada_id || tema.portada_recurso_id || tema.portada?.id || tema.portada?.url);
  const gruposCompletos = grupos.length > 0;
  const pasosCreados = pasos.length;
  const pasosCompletos = pasosCreados >= 6;

  let contenidosCreados = 0;
  const grupoIds = new Set(grupos.map((g: any) => g.id));
  for (const paso of pasos) {
    const contenidos = Array.isArray(paso.contenidos) ? paso.contenidos : [];
    for (const c of contenidos) {
      if (
        (grupoIds.size === 0 || grupoIds.has(c.grupo_edad_id)) &&
        ((typeof c.titulo === "string" && c.titulo.trim().length > 0) ||
          (typeof c.cuerpo === "string" && c.cuerpo.trim().length > 0))
      ) {
        contenidosCreados += 1;
      }
    }
  }
  const contenidosEsperados = Math.max(1, grupos.length) * 6;
  const contenidoCrecerCompleto = contenidosCreados > 0 && contenidosCreados >= contenidosEsperados;
  const actividadesCompletas = actividades.length > 0;
  const previosListos =
    fichaBaseCompleta &&
    portadaCompleta &&
    gruposCompletos &&
    pasosCompletos &&
    contenidoCrecerCompleto &&
    actividadesCompletas;

  const criterios = [
    {
      codigo: "ficha_base",
      etiqueta: "Datos generales y versículo",
      completo: fichaBaseCompleta,
      detalle: fichaBaseCompleta ? "" : "Completa el título, resumen y versículo clave.",
    },
    {
      codigo: "portada",
      etiqueta: "Imagen de portada",
      completo: portadaCompleta,
      detalle: portadaCompleta ? "" : "Elige una imagen de portada en el Paso 2.",
    },
    {
      codigo: "grupos_edad",
      etiqueta: "Edades destinatarias",
      completo: gruposCompletos,
      detalle: gruposCompletos ? "" : "Selecciona al menos una franja de edad.",
    },
    {
      codigo: "pasos_crecer",
      etiqueta: "Estructura de 6 momentos CRECER",
      completo: pasosCompletos,
      detalle: pasosCompletos ? "" : "Inicializa los 6 momentos CRECER.",
    },
    {
      codigo: "contenido_crecer",
      etiqueta: "Contenido CRECER por franja",
      completo: contenidoCrecerCompleto,
      detalle: contenidoCrecerCompleto
        ? ""
        : `Faltan momentos CRECER por completar (${contenidosCreados}/${contenidosEsperados}).`,
    },
    {
      codigo: "actividades",
      etiqueta: "Actividades interactivas",
      completo: actividadesCompletas,
      detalle: actividadesCompletas ? "" : "Agrega al menos 1 actividad en el Paso 4.",
    },
    {
      codigo: "publicacion",
      etiqueta: "Listo para publicar",
      completo: previosListos,
      detalle: previosListos ? "" : "Completa todos los pasos anteriores antes de publicar.",
    },
  ];

  const bloqueos = criterios.filter((c) => !c.completo).map((c) => c.detalle || c.etiqueta);
  const porcentaje = Math.round((criterios.filter((c) => c.completo).length / criterios.length) * 100);

  tema.completitud = {
    porcentaje,
    listo_para_revision: previosListos,
    bloqueos,
    criterios,
    estadisticas: {
      grupos_edad: grupos.length,
      pasos_totales: 6,
      pasos_creados: pasosCreados,
      contenidos_creados: contenidosCreados,
      contenidos_esperados: contenidosEsperados,
      actividades: actividades.length,
    },
  };
  return tema.completitud;
}

for (const t of devStore.temas) {
  if (!devStore.pasosPorTema[t.id]) {
    devStore.pasosPorTema[t.id] = crearPasosBaseParaTema(t, t.estado === "publicado");
  }
  recalcularCompletitudTemaDev(t);
}
enriquecerActividadesOpciones(devStore.actividades);
guardarDevStoreEnDisco();

function buscarTemaDev(temaId: string): Record<string, any> | undefined {
  return devStore.temas.find((item) => item?.id === temaId);
}

function construirPasosProxyParaTema(tema: Record<string, any>): any[] {
  if (!devStore.pasosPorTema[tema.id]) {
    devStore.pasosPorTema[tema.id] = crearPasosBaseParaTema(tema, false);
  }
  return devStore.pasosPorTema[tema.id];
}

function construirActividadesProxyParaTema(tema: Record<string, any>): any[] {
  const lista = devStore.actividades.filter((a) => a.tema_id === tema.id);
  enriquecerActividadesOpciones(lista);
  return lista.sort((a, b) => (a.orden ?? 1) - (b.orden ?? 1));
}

function construirPayloadRutaTemaAdmin(pathname: string): Record<string, any> | null {
  const parts = pathname.split("/").filter(Boolean);
  const temaId = parts[2];
  const subruta = parts[3] || "";
  if (!temaId) return null;

  const tema = buscarTemaDev(temaId);
  if (!tema) return null;

  recalcularCompletitudTemaDev(tema);
  const pasos = construirPasosProxyParaTema(tema);
  const actividades = construirActividadesProxyParaTema(tema);
  const revisiones = devStore.revisiones.filter((r) => r.tema_id === tema.id);

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
        revisiones,
      },
    };
  }
  return { exito: true, datos: tema };
}

function construirResumenDetalladoDev() {
  const estados = {
    borrador: 0,
    revision: 0,
    aprobado: 0,
    publicado: 0,
    archivado: 0,
  };
  for (const t of devStore.temas) {
    recalcularCompletitudTemaDev(t);
    const e = String(t.estado || "borrador");
    if (e in estados) {
      estados[e as keyof typeof estados] += 1;
    }
  }
  const temasRecientes = [...devStore.temas]
    .sort((a, b) => String(b.actualizado_en || "").localeCompare(String(a.actualizado_en || "")))
    .slice(0, 6)
    .map((t) => ({
      id: t.id,
      titulo: t.titulo,
      estado: t.estado,
      actualizado_en: t.actualizado_en,
      senda: t.senda?.nombre || "Senda",
      autor: t.autor || "Administrador",
    }));

  const revisionesPendientes = devStore.revisiones.filter((r) => r.estado === "pendiente" || r.estado === "revision");
  return {
    exito: true,
    datos: {
      metricas: {
        ...SNAPSHOT_RESUMEN_DETALLADO.datos.metricas,
        temas: devStore.temas.length,
        publicados: estados.publicado,
        usuarios_activos: Math.max(SNAPSHOT_RESUMEN_DETALLADO.datos.metricas.usuarios_activos, devStore.usuarios.length),
        actividades: devStore.actividades.length,
        clubes_activos: devStore.clubes.filter((c) => c.activo !== false).length,
        pendientes_revision: revisionesPendientes.length,
      },
      estados,
      temas_recientes: temasRecientes,
      revisiones: revisionesPendientes,
      actividad_reciente: SNAPSHOT_RESUMEN_DETALLADO.datos.actividad_reciente,
      publicaciones_semana: SNAPSHOT_RESUMEN_DETALLADO.datos.publicaciones_semana,
    },
  };
}

function filtrarYResponderGetDev(url: URL): Record<string, any> | null {
  const path = url.pathname;
  const params = url.searchParams;

  if (path === "/perfil") return SNAPSHOT_PERFIL_ADMIN;
  if (path === "/administracion/resumen/detallado") return construirResumenDetalladoDev();
  if (path === "/administracion/sendas") return { exito: true, datos: CATALOGO_SENDAS_PROXY };

  if (path === "/administracion/temas-listado" || path === "/administracion/temas") {
    const q = (params.get("q") || "").trim().toLowerCase();
    const estado = (params.get("estado") || params.get("status") || "").trim().toLowerCase();
    const sendaId = (params.get("senda_id") || "").trim();
    const grupoEdadId = (params.get("grupo_edad_id") || "").trim();
    const limit = Math.max(1, Number(params.get("limit")) || 50);
    const offset = Math.max(0, Number(params.get("offset")) || 0);

    for (const t of devStore.temas) {
      recalcularCompletitudTemaDev(t);
    }

    const filtered = devStore.temas
      .filter((t) => {
        if (estado && estado !== "todos" && String(t.estado || "").toLowerCase() !== estado) {
          return false;
        }
        if (sendaId && t.senda_id !== sendaId && t.senda?.id !== sendaId) {
          return false;
        }
        if (
          grupoEdadId &&
          !(Array.isArray(t.grupos_edad) && t.grupos_edad.some((g: any) => g.id === grupoEdadId || g === grupoEdadId))
        ) {
          return false;
        }
        if (q) {
          const texto = [
            t.titulo,
            t.resumen,
            t.objetivo,
            t.slug,
            t.senda?.nombre,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!texto.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => String(b.actualizado_en || "").localeCompare(String(a.actualizado_en || "")));

    if (path === "/administracion/temas") {
      return { exito: true, datos: filtered };
    }
    const paged = filtered.slice(offset, offset + limit);
    return {
      exito: true,
      datos: {
        temas: paged,
        total: filtered.length,
        limit,
        offset,
      },
    };
  }

  if (path.startsWith("/administracion/temas/")) {
    return construirPayloadRutaTemaAdmin(path);
  }

  if (path === "/administracion/actividades") {
    const temaId = (params.get("tema_id") || "").trim();
    const grupoEdadId = (params.get("grupo_edad_id") || "").trim();
    const tipoId = (params.get("tipo_actividad_id") || "").trim();
    const estado = (params.get("estado") || "").trim().toLowerCase();
    const q = (params.get("q") || "").trim().toLowerCase();
    const limit = Math.max(1, Number(params.get("limit")) || 50);
    const offset = Math.max(0, Number(params.get("offset")) || 0);

    enriquecerActividadesOpciones(devStore.actividades);
    const filtered = devStore.actividades.filter((a) => {
      if (temaId && a.tema_id !== temaId) return false;
      if (grupoEdadId && a.grupo_edad_id !== grupoEdadId && a.grupo_edad?.id !== grupoEdadId) return false;
      if (tipoId && a.tipo_actividad_id !== tipoId && a.tipo_actividad?.id !== tipoId) return false;
      if (estado && estado !== "todos" && String(a.estado || "").toLowerCase() !== estado) return false;
      if (q) {
        const hay = [a.titulo, a.consigna, a.tema?.titulo, a.tipo_actividad?.nombre].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return {
      exito: true,
      datos: {
        actividades: filtered.slice(offset, offset + limit),
        total: filtered.length,
      },
    };
  }

  if (path.startsWith("/administracion/actividades/")) {
    const actId = path.split("/")[3];
    const foundAct = devStore.actividades.find((a) => a.id === actId) ?? devStore.actividades[0] ?? null;
    if (!foundAct) return null;
    const act = JSON.parse(JSON.stringify(foundAct));
    enriquecerActividadesOpciones([act]);
    return { exito: true, datos: act };
  }

  if (path === "/administracion/revisiones") {
    const estado = (params.get("estado") || "").trim().toLowerCase();
    const q = (params.get("q") || "").trim().toLowerCase();
    const filtered = devStore.revisiones.filter((r) => {
      if (estado && estado !== "todos" && String(r.estado || "").toLowerCase() !== estado) return false;
      if (q) {
        const hay = [r.tema?.titulo, r.notas, r.solicitante?.nombre_visible].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return {
      exito: true,
      datos: {
        revisiones: filtered,
        total: filtered.length,
        limit: 50,
        offset: 0,
      },
    };
  }

  if (path.startsWith("/administracion/revisiones/")) {
    const revId = path.split("/")[3];
    const rev = devStore.revisiones.find((r) => r.id === revId);
    return rev ? { exito: true, datos: rev } : null;
  }

  if (path === "/administracion/usuarios") {
    const q = (params.get("q") || "").trim().toLowerCase();
    const rol = (params.get("rol") || "").trim().toLowerCase();
    const estado = (params.get("estado") || "").trim().toLowerCase();
    const grupoEdadId = (params.get("grupo_edad_id") || "").trim();
    const clubId = (params.get("club_id") || "").trim();
    const limit = Math.max(1, Number(params.get("limit")) || 20);
    const offset = Math.max(0, Number(params.get("offset")) || 0);

    const list = devStore.usuarios.filter((u: any) => {
      if (rol && rol !== "todos" && String(u.rol || "").toLowerCase() !== rol) return false;
      const uEstado = String(u.estado ?? (u.activo === false ? "bloqueado" : "activo")).toLowerCase();
      if (estado && estado !== "todos" && uEstado !== estado) return false;
      const uGrupoId = u.grupo_edad?.id || u.perfil?.grupo_edad_id || u.grupo_edad_id || "";
      if (grupoEdadId && uGrupoId !== grupoEdadId) return false;
      if (clubId && !(Array.isArray(u.clubes) && u.clubes.some((c: any) => c.id === clubId))) return false;
      if (q) {
        const hay = [u.nombre_visible, u.correo, u.apodo].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const resumen = {
      total: devStore.usuarios.length,
      activos: devStore.usuarios.filter((u: any) => (u.estado ?? (u.activo === false ? "bloqueado" : "activo")) === "activo").length,
      pendientes: devStore.usuarios.filter((u: any) => u.estado === "pendiente").length,
      bloqueados: devStore.usuarios.filter((u: any) => u.activo === false || u.estado === "bloqueado").length,
      administradores: devStore.usuarios.filter((u: any) => u.rol === "administrador").length,
      padres: devStore.usuarios.filter((u: any) => u.rol === "padre").length,
    };

    const catalogos = {
      ...SNAPSHOT_USUARIOS.datos.catalogos,
      clubes: devStore.clubes.map((c: any) => ({ id: c.id, nombre: c.nombre, activo: c.activo !== false })),
    };

    return {
      exito: true,
      datos: {
        usuarios: list.slice(offset, offset + limit),
        total: list.length,
        limit,
        offset,
        resumen,
        catalogos,
      },
    };
  }

  if (path.startsWith("/administracion/usuarios/")) {
    const userId = path.split("/")[3];
    const baseUser = devStore.usuarios.find((u: any) => u.id === userId);
    if (!baseUser) return null;
    return {
      exito: true,
      datos: {
        ...baseUser,
        vinculos: Array.isArray(baseUser.vinculos) ? baseUser.vinculos : [],
        estadisticas: baseUser.estadisticas ?? {
          temas_total: 4,
          temas_completados: 2,
          actividades_total: 12,
          actividades_completadas: 8,
          intentos: 10,
          xp_total: baseUser.progreso?.xp_total ?? 420,
        },
        actividad_reciente: Array.isArray(baseUser.actividad_reciente) ? baseUser.actividad_reciente : [],
        auditoria: Array.isArray(baseUser.auditoria) ? baseUser.auditoria : [],
      },
    };
  }

  if (path === "/administracion/clubes") {
    const q = (params.get("q") || "").trim().toLowerCase();
    const estado = (params.get("estado") || "").trim().toLowerCase();
    const activo = params.get("activo");
    const orden = (params.get("orden") || "recientes").trim().toLowerCase();
    const limit = Math.max(1, Number(params.get("limit")) || 20);
    const offset = Math.max(0, Number(params.get("offset")) || 0);

    const list = devStore.clubes
      .filter((c: any) => {
        const esActivo = c.activo !== false;
        if (estado === "activo" && !esActivo) return false;
        if (estado === "archivado" && esActivo) return false;
        if (activo === "true" && !esActivo) return false;
        if (activo === "false" && esActivo) return false;
        if (q && !`${c.nombre || ""} ${c.descripcion || ""} ${c.lider?.apodo || ""}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a: any, b: any) => {
        if (orden === "nombre") return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es");
        if (orden === "miembros") return Number(b.miembros || 0) - Number(a.miembros || 0);
        return String(b.creado_en || "").localeCompare(String(a.creado_en || ""));
      });

    return {
      exito: true,
      datos: {
        clubes: list.slice(offset, offset + limit),
        total: list.length,
        meta: { total: list.length, limit, offset },
      },
    };
  }

  if (path.startsWith("/administracion/clubes/")) {
    const clubId = path.split("/")[3];
    const detalle = devStore.clubDetalles[clubId];
    if (detalle) return { exito: true, datos: detalle };
    const club = devStore.clubes.find((c: any) => c.id === clubId);
    return club ? { exito: true, datos: construirClubDetalleBase(club) } : null;
  }

  if (path === "/administracion/reportes-clubes") {
    const estado = (params.get("estado") || "").trim().toLowerCase();
    const list = devStore.reportesClubes.filter((r: any) => !estado || String(r.estado || "").toLowerCase() === estado);
    return { exito: true, datos: list };
  }

  if (path === "/administracion/logros" || path === "/administracion/logros/catalogo") {
    if (path.endsWith("/catalogo")) {
      return {
        exito: true,
        datos: devStore.logros.map((l: any) => ({ id: l.id, codigo: l.codigo, nombre: l.nombre })),
      };
    }

    const q = (params.get("q") || "").trim().toLowerCase();
    const estado = (params.get("estado") || "").trim().toLowerCase();
    const criterio = (params.get("criterio") || "").trim().toLowerCase();
    const limit = Math.max(1, Number(params.get("limit")) || 20);
    const offset = Math.max(0, Number(params.get("offset")) || 0);

    const list = devStore.logros.filter((l: any) => {
      const esActivo = l.activo !== false;
      if (estado === "activo" && !esActivo) return false;
      if (estado === "archivado" && esActivo) return false;
      const critCodigo = String(l.codigo_criterio || l.criterio_raiz?.tipo || "").toLowerCase();
      if (criterio && criterio !== "todos" && critCodigo !== criterio) return false;
      if (q && !`${l.nombre || ""} ${l.descripcion || ""} ${l.codigo || ""}`.toLowerCase().includes(q)) return false;
      return true;
    });

    return {
      exito: true,
      datos: {
        logros: list.slice(offset, offset + limit),
        total: list.length,
        meta: { total: list.length, limit, offset },
      },
    };
  }

  if (path.startsWith("/administracion/logros/")) {
    const logroId = path.split("/")[3];
    const logro = devStore.logros.find((l: any) => l.id === logroId);
    return logro ? { exito: true, datos: logro } : null;
  }

  if (path === "/administracion/reportes") {
    return SNAPSHOT_REPORTES;
  }

  if (path === "/administracion/ajustes") {
    return { exito: true, datos: devStore.ajustes };
  }

  return null;
}

function aplicarMutacionDev(method: string, pathname: string, body: Record<string, any> | null): { status: number; payload: Record<string, any> } | null {
  const ahora = new Date().toISOString();
  const payload = body ?? {};

  // 1. POST /administracion/temas (Crear tema borrador)
  if (method === "POST" && pathname === "/administracion/temas") {
    const id = crypto.randomUUID();
    const titulo = String(payload.titulo || "Tema sin título").trim();
    const slugBase = normalizarSlugProxy(String(payload.slug || titulo));
    const slugUnico = devStore.temas.some((t) => t.slug === slugBase)
      ? `${slugBase}-${id.slice(0, 4)}`
      : slugBase;
    const sendaObj = buscarSendaProxy(payload.senda_id);
    const gruposEdad = resolverGruposEdadProxy(payload.grupo_edad_ids);
    const portadaId = typeof payload.portada_recurso_id === "string" && payload.portada_recurso_id ? payload.portada_recurso_id : null;
    const portada = resolverPortadaProxy(portadaId, null);

    if (payload.versiculo_clave && typeof payload.versiculo_clave.texto === "string" && payload.versiculo_clave.texto.trim()) {
      versiculosPorTema.set(id, {
        libro_id: Number(payload.versiculo_clave.libro_id) || 43,
        capitulo: Number(payload.versiculo_clave.capitulo) || 1,
        versiculo_inicio: Number(payload.versiculo_clave.versiculo_inicio ?? payload.versiculo_clave.versiculo) || 1,
        versiculo_fin: payload.versiculo_clave.versiculo_fin ? Number(payload.versiculo_clave.versiculo_fin) : null,
        texto: payload.versiculo_clave.texto.trim(),
        parte_historia:
          typeof payload.versiculo_clave.parte_historia === "string" && payload.versiculo_clave.parte_historia.trim()
            ? payload.versiculo_clave.parte_historia.trim()
            : null,
      });
    }

    const nuevoTema: Record<string, any> = {
      id,
      titulo,
      slug: slugUnico,
      resumen: String(payload.resumen || "").trim(),
      objetivo: String(payload.objetivo || "").trim(),
      estado: "borrador",
      version_contenido: Number(payload.version_contenido) || 1,
      version_biblica_id: payload.version_biblica_id ?? null,
      minutos_estimados: Number(payload.minutos_estimados) || 15,
      xp_recompensa: Number(payload.xp_recompensa) || 50,
      es_destacado: Boolean(payload.es_destacado),
      publicado_en: null,
      actualizado_en: ahora,
      creado_en: ahora,
      autor: "Administrador",
      senda_id: sendaObj.id,
      senda: sendaObj,
      portada_recurso_id: portadaId,
      portada_id: portadaId,
      portada,
      grupos_edad: gruposEdad,
    };

    devStore.pasosPorTema[id] = crearPasosBaseParaTema(nuevoTema, false);
    devStore.temas.unshift(nuevoTema);
    recalcularCompletitudTemaDev(nuevoTema);
    guardarDevStoreEnDisco();
    return { status: 201, payload: { exito: true, datos: nuevoTema } };
  }

  // 2. PATCH /administracion/temas/:id
  if (method === "PATCH" && pathname.startsWith("/administracion/temas/")) {
    const parts = pathname.split("/").filter(Boolean);
    const temaId = parts[2];
    const tema = buscarTemaDev(temaId);
    if (!tema) {
      return { status: 404, payload: { exito: false, error: "Tema no encontrado" } };
    }

    if (typeof payload.titulo === "string") tema.titulo = payload.titulo.trim();
    if (typeof payload.slug === "string" && payload.slug.trim()) tema.slug = normalizarSlugProxy(payload.slug);
    if (typeof payload.resumen === "string") tema.resumen = payload.resumen;
    if (typeof payload.objetivo === "string") tema.objetivo = payload.objetivo;
    if (payload.version_contenido !== undefined) tema.version_contenido = Number(payload.version_contenido) || 1;
    if (payload.version_biblica_id !== undefined) tema.version_biblica_id = payload.version_biblica_id;
    if (payload.minutos_estimados !== undefined) tema.minutos_estimados = Number(payload.minutos_estimados) || 15;
    if (payload.xp_recompensa !== undefined) tema.xp_recompensa = Number(payload.xp_recompensa) || 50;
    if (payload.es_destacado !== undefined) tema.es_destacado = Boolean(payload.es_destacado);

    if (typeof payload.senda_id === "string" && payload.senda_id) {
      const sendaObj = buscarSendaProxy(payload.senda_id);
      tema.senda_id = sendaObj.id;
      tema.senda = sendaObj;
    }
    if (Array.isArray(payload.grupo_edad_ids)) {
      tema.grupos_edad = resolverGruposEdadProxy(payload.grupo_edad_ids);
    }
    if (payload.portada_recurso_id !== undefined) {
      tema.portada_recurso_id = payload.portada_recurso_id;
      tema.portada_id = payload.portada_recurso_id;
      tema.portada = payload.portada_recurso_id ? resolverPortadaProxy(payload.portada_recurso_id, tema.portada) : null;
    }
    if (payload.versiculo_clave && typeof payload.versiculo_clave === "object") {
      const vc = payload.versiculo_clave;
      if (typeof vc.texto === "string" && vc.texto.trim()) {
        versiculosPorTema.set(temaId, {
          libro_id: Number(vc.libro_id) || 43,
          capitulo: Number(vc.capitulo) || 1,
          versiculo_inicio: Number(vc.versiculo_inicio ?? vc.versiculo) || 1,
          versiculo_fin: vc.versiculo_fin ? Number(vc.versiculo_fin) : null,
          texto: vc.texto.trim(),
          parte_historia: typeof vc.parte_historia === "string" && vc.parte_historia.trim() ? vc.parte_historia.trim() : null,
        });
      }
    }
    tema.actualizado_en = ahora;
    recalcularCompletitudTemaDev(tema);
    enriquecerActividadesOpciones(devStore.actividades.filter((a) => a.tema_id === temaId));
    guardarDevStoreEnDisco();
    return { status: 200, payload: { exito: true, datos: tema } };
  }

  // 3. POST /administracion/temas/:id/pasos (Guardar contenido CRECER)
  if (method === "POST" && pathname.startsWith("/administracion/temas/") && pathname.endsWith("/pasos")) {
    const parts = pathname.split("/").filter(Boolean);
    const temaId = parts[2];
    const tema = buscarTemaDev(temaId);
    if (!tema) {
      return { status: 404, payload: { exito: false, error: "Tema no encontrado" } };
    }
    const pasos = construirPasosProxyParaTema(tema);
    const tipoPasoId = String(payload.tipo_paso_id || "");
    const grupoEdadId = String(payload.grupo_edad_id || "");
    const cInput = payload.contenido && typeof payload.contenido === "object" ? payload.contenido : payload;

    let paso = pasos.find((p) => p.tipo_paso_id === tipoPasoId || p.id === tipoPasoId);
    if (!paso) {
      const fase = FASES_CRECER_PROXY.find((f) => f.id === tipoPasoId) ?? FASES_CRECER_PROXY[0];
      paso = {
        id: `paso-${tema.id}-${fase.codigo}`,
        tema_id: tema.id,
        tipo_paso_id: fase.id,
        orden: Number(payload.orden) || fase.orden,
        tipo_paso: { id: fase.id, codigo: fase.codigo, nombre: fase.nombre, color_hex: fase.color_hex },
        contenidos: [],
        preguntas: [],
      };
      pasos.push(paso);
    }

    if (grupoEdadId) {
      const idx = paso.contenidos.findIndex((c: any) => c.grupo_edad_id === grupoEdadId);
      const registroContenido = {
        id: idx >= 0 ? paso.contenidos[idx].id : `contenido-${temaId}-${paso.tipo_paso.codigo}-${grupoEdadId}`,
        grupo_edad_id: grupoEdadId,
        titulo: String(cInput.titulo ?? payload.titulo ?? "").trim(),
        cuerpo: String(cInput.cuerpo ?? payload.cuerpo ?? ""),
        instruccion_corta: cInput.instruccion_corta ?? payload.instruccion_corta ?? null,
        recurso_id: cInput.recurso_id ?? payload.recurso_id ?? null,
        recurso_audio_id: cInput.recurso_audio_id ?? payload.recurso_audio_id ?? null,
      };
      if (idx >= 0) {
        paso.contenidos[idx] = registroContenido;
      } else {
        paso.contenidos.push(registroContenido);
      }

      if (Array.isArray(payload.preguntas)) {
        paso.preguntas = [
          ...(paso.preguntas || []).filter((q: any) => q.grupo_edad_id !== grupoEdadId),
          ...payload.preguntas
            .map((q: any, qIdx: number) => ({
              id: q.id || `preg-${temaId}-${grupoEdadId}-${Date.now()}-${qIdx}`,
              grupo_edad_id: grupoEdadId,
              pregunta: String(q.pregunta || "").trim(),
              orden: q.orden ?? qIdx + 1,
            }))
            .filter((q: any) => q.pregunta.length > 0),
        ];
      }
    }

    tema.actualizado_en = ahora;
    recalcularCompletitudTemaDev(tema);
    enriquecerActividadesOpciones(devStore.actividades.filter((a) => a.tema_id === temaId));
    guardarDevStoreEnDisco();
    return { status: 200, payload: { exito: true, datos: paso } };
  }

  // 4. POST /administracion/temas/:id/{publicar,borrador,archivar,enviar-revision,resolver-revision,duplicar}
  if (method === "POST" && pathname.startsWith("/administracion/temas/")) {
    const parts = pathname.split("/").filter(Boolean);
    const temaId = parts[2];
    const accion = parts[3];
    const tema = buscarTemaDev(temaId);
    if (!tema) {
      return { status: 404, payload: { exito: false, error: "Tema no encontrado" } };
    }

    if (accion === "publicar") {
      estadosPorTema.set(temaId, { estado: "publicado", publicado_en: ahora });
      tema.estado = "publicado";
      tema.publicado_en = ahora;
      tema.actualizado_en = ahora;
      recalcularCompletitudTemaDev(tema);
      enriquecerActividadesOpciones(devStore.actividades.filter((a) => a.tema_id === temaId));
      guardarDevStoreEnDisco();
      return { status: 200, payload: { exito: true, datos: tema } };
    }
    if (accion === "borrador") {
      estadosPorTema.set(temaId, { estado: "borrador", publicado_en: null });
      tema.estado = "borrador";
      tema.publicado_en = null;
      tema.actualizado_en = ahora;
      recalcularCompletitudTemaDev(tema);
      enriquecerActividadesOpciones(devStore.actividades.filter((a) => a.tema_id === temaId));
      guardarDevStoreEnDisco();
      return { status: 200, payload: { exito: true, datos: tema } };
    }
    if (accion === "archivar") {
      estadosPorTema.set(temaId, { estado: "archivado", publicado_en: tema.publicado_en ?? null });
      tema.estado = "archivado";
      tema.actualizado_en = ahora;
      enriquecerActividadesOpciones(devStore.actividades.filter((a) => a.tema_id === temaId));
      guardarDevStoreEnDisco();
      return { status: 200, payload: { exito: true, datos: tema } };
    }
    if (accion === "enviar-revision") {
      estadosPorTema.set(temaId, { estado: "revision", publicado_en: null });
      tema.estado = "revision";
      tema.actualizado_en = ahora;
      const revId = crypto.randomUUID();
      devStore.revisiones.unshift({
        id: revId,
        tema_id: tema.id,
        estado: "pendiente",
        notas: String(payload.notas || "Enviado para revisión editorial."),
        creado_en: ahora,
        actualizado_en: ahora,
        tema: { id: tema.id, titulo: tema.titulo, slug: tema.slug, estado: tema.estado },
        solicitante: { id: "aff4c70c-086c-43f3-8501-b55bb13807b2", nombre_visible: "Administrador" },
      });
      enriquecerActividadesOpciones(devStore.actividades.filter((a) => a.tema_id === temaId));
      guardarDevStoreEnDisco();
      return { status: 200, payload: { exito: true, datos: { ...tema, revision_id: revId } } };
    }
    if (accion === "resolver-revision") {
      const nuevoEstado = String(payload.estado || (payload.decision === "aprobar" ? "aprobado" : "borrador"));
      estadosPorTema.set(temaId, { estado: nuevoEstado, publicado_en: nuevoEstado === "publicado" ? ahora : null });
      tema.estado = nuevoEstado;
      tema.actualizado_en = ahora;
      for (const r of devStore.revisiones) {
        if (r.tema_id === tema.id && r.estado === "pendiente") {
          r.estado = nuevoEstado === "aprobado" || nuevoEstado === "publicado" ? "aprobado" : "rechazado";
          r.notas = String(payload.notas || r.notas);
          r.actualizado_en = ahora;
        }
      }
      enriquecerActividadesOpciones(devStore.actividades.filter((a) => a.tema_id === temaId));
      guardarDevStoreEnDisco();
      return { status: 200, payload: { exito: true, datos: tema } };
    }
    if (accion === "duplicar") {
      const copyId = crypto.randomUUID();
      const copia = JSON.parse(JSON.stringify(tema));
      copia.id = copyId;
      copia.titulo = `${tema.titulo} (copia)`;
      copia.slug = `${normalizarSlugProxy(tema.slug || tema.titulo)}-copia-${copyId.slice(0, 4)}`;
      copia.estado = "borrador";
      copia.publicado_en = null;
      copia.creado_en = ahora;
      copia.actualizado_en = ahora;
      const vc = versiculosPorTema.get(tema.id);
      if (vc) versiculosPorTema.set(copyId, { ...vc });
      devStore.pasosPorTema[copyId] = JSON.parse(JSON.stringify(construirPasosProxyParaTema(tema))).map((p: any) => ({
        ...p,
        id: `paso-${copyId}-${p.tipo_paso?.codigo || "paso"}`,
        tema_id: copyId,
      }));
      const actsOrig = devStore.actividades.filter((a) => a.tema_id === tema.id);
      for (const a of actsOrig) {
        const aCopy = JSON.parse(JSON.stringify(a));
        aCopy.id = crypto.randomUUID();
        aCopy.tema_id = copyId;
        aCopy.tema = { id: copyId, titulo: copia.titulo, slug: copia.slug, estado: copia.estado, senda: copia.senda };
        devStore.actividades.push(aCopy);
      }
      devStore.temas.unshift(copia);
      recalcularCompletitudTemaDev(copia);
      guardarDevStoreEnDisco();
      return { status: 201, payload: { exito: true, datos: copia } };
    }
    if (accion === "actividades" && parts[4] === "reordenar") {
      const ordenIds = Array.isArray(payload.actividades) ? payload.actividades : Array.isArray(payload.orden) ? payload.orden : [];
      ordenIds.forEach((item: any, idx: number) => {
        const idAct = typeof item === "string" ? item : item?.id;
        const found = devStore.actividades.find((a) => a.id === idAct && a.tema_id === temaId);
        if (found) found.orden = Number(item?.orden ?? idx + 1);
      });
      guardarDevStoreEnDisco();
      return { status: 200, payload: { exito: true, datos: { ok: true } } };
    }
  }

  // 5. Actividades CRUD (/administracion/actividades*)
  if (method === "POST" && pathname === "/administracion/actividades") {
    const actId = crypto.randomUUID();
    const tema = buscarTemaDev(String(payload.tema_id || ""));
    const tipo =
      CATALOGO_TIPOS_ACTIVIDAD_PROXY.find((t) => t.id === payload.tipo_actividad_id || t.codigo === payload.tipo_actividad_id) ??
      CATALOGO_TIPOS_ACTIVIDAD_PROXY[8];
    const grupo =
      CATALOGO_GRUPOS_EDAD_PROXY.find((g) => g.id === payload.grupo_edad_id || g.codigo === payload.grupo_edad_id) ??
      CATALOGO_GRUPOS_EDAD_PROXY[0];
    const ordenExistente = devStore.actividades.filter((a) => a.tema_id === payload.tema_id).length;

    const nuevaAct: Record<string, any> = {
      id: actId,
      tema_id: payload.tema_id,
      paso_id: payload.paso_id ?? null,
      grupo_edad_id: grupo.id,
      tipo_actividad_id: tipo.id,
      titulo: String(payload.titulo || "Nueva actividad").trim(),
      consigna: String(payload.consigna || "").trim(),
      retroalimentacion: payload.retroalimentacion ?? "¡Excelente trabajo!",
      dificultad: payload.dificultad || "normal",
      xp_recompensa: Number(payload.xp_recompensa) || 20,
      limite_tiempo_seg: payload.limite_tiempo_seg ?? null,
      orden: Number(payload.orden) || ordenExistente + 1,
      obligatorio: payload.obligatorio ?? true,
      estado:
        tema?.estado === "publicado"
          ? "publicada"
          : tema?.estado === "revision"
            ? "revision"
            : "borrador",
      creado_en: ahora,
      actualizado_en: ahora,
      configuracion: payload.configuracion ?? {},
      opciones: Array.isArray(payload.opciones) ? payload.opciones : [],
      tipo_actividad: { id: tipo.id, codigo: tipo.codigo, nombre: tipo.nombre },
      grupo_edad: { id: grupo.id, codigo: grupo.codigo, nombre: grupo.nombre },
      tema: tema
        ? { id: tema.id, titulo: tema.titulo, slug: tema.slug, estado: tema.estado, senda: tema.senda }
        : undefined,
    };
    enriquecerActividadesOpciones([nuevaAct]);
    devStore.actividades.push(nuevaAct);
    if (tema) {
      tema.actualizado_en = ahora;
      recalcularCompletitudTemaDev(tema);
    }
    guardarDevStoreEnDisco();
    return { status: 201, payload: { exito: true, datos: nuevaAct } };
  }

  if (pathname.startsWith("/administracion/actividades/")) {
    const parts = pathname.split("/").filter(Boolean);
    const actId = parts[2];
    const sub = parts[3];
    const idx = devStore.actividades.findIndex((a) => a.id === actId);
    if (idx < 0) {
      return { status: 404, payload: { exito: false, error: "Actividad no encontrada" } };
    }
    const actual = devStore.actividades[idx];
    if (method === "PATCH") {
      Object.assign(actual, {
        ...payload,
        id: actual.id,
        actualizado_en: ahora,
      });
      if (payload.tipo_actividad_id) {
        const tipo = CATALOGO_TIPOS_ACTIVIDAD_PROXY.find((t) => t.id === payload.tipo_actividad_id);
        if (tipo) actual.tipo_actividad = { id: tipo.id, codigo: tipo.codigo, nombre: tipo.nombre };
      }
      if (payload.grupo_edad_id) {
        const grupo = CATALOGO_GRUPOS_EDAD_PROXY.find((g) => g.id === payload.grupo_edad_id);
        if (grupo) actual.grupo_edad = { id: grupo.id, codigo: grupo.codigo, nombre: grupo.nombre };
      }
      enriquecerActividadesOpciones([actual]);
      const tema = buscarTemaDev(actual.tema_id);
      if (tema) recalcularCompletitudTemaDev(tema);
      guardarDevStoreEnDisco();
      return { status: 200, payload: { exito: true, datos: actual } };
    }
    if (method === "DELETE") {
      const removed = devStore.actividades.splice(idx, 1)[0];
      const tema = removed ? buscarTemaDev(removed.tema_id) : undefined;
      if (tema) recalcularCompletitudTemaDev(tema);
      guardarDevStoreEnDisco();
      return { status: 200, payload: { exito: true, datos: { id: actId, eliminada: true } } };
    }
    if (method === "POST" && sub === "duplicar") {
      const copia = JSON.parse(JSON.stringify(actual));
      copia.id = crypto.randomUUID();
      copia.titulo = `${actual.titulo} (copia)`;
      copia.orden = devStore.actividades.filter((a) => a.tema_id === actual.tema_id).length + 1;
      copia.creado_en = ahora;
      copia.actualizado_en = ahora;
      devStore.actividades.push(copia);
      const tema = buscarTemaDev(actual.tema_id);
      if (tema) recalcularCompletitudTemaDev(tema);
      guardarDevStoreEnDisco();
      return { status: 201, payload: { exito: true, datos: copia } };
    }
  }

  // 6. Revisiones resolver
  if (method === "POST" && pathname.startsWith("/administracion/revisiones/") && pathname.endsWith("/resolver")) {
    const revId = pathname.split("/").filter(Boolean)[2];
    const rev = devStore.revisiones.find((r) => r.id === revId);
    if (rev) {
      const decision = String(payload.decision || "aprobar");
      rev.estado = decision === "aprobar" ? "aprobado" : "rechazado";
      rev.notas = String(payload.notas || rev.notas || "");
      rev.actualizado_en = ahora;
      const tema = buscarTemaDev(rev.tema_id);
      if (tema) {
        tema.estado = decision === "aprobar" ? "aprobado" : "borrador";
        tema.actualizado_en = ahora;
        recalcularCompletitudTemaDev(tema);
        enriquecerActividadesOpciones(devStore.actividades.filter((a) => a.tema_id === tema.id));
      }
      guardarDevStoreEnDisco();
      return { status: 200, payload: { exito: true, datos: rev } };
    }
  }

  // 7. Clubes CRUD & subrutas
  if (method === "POST" && pathname === "/administracion/clubes") {
    const id = crypto.randomUUID();
    const liderUsuario = devStore.usuarios.find((u) => u.id === payload.lider_usuario_id) ?? devStore.usuarios[0];
    const nuevoClub = {
      id,
      nombre: String(payload.nombre || "Club Semillas").trim(),
      descripcion: payload.descripcion ? String(payload.descripcion).trim() : null,
      activo: true,
      creado_en: ahora,
      miembros: liderUsuario ? 1 : 0,
      retos_abiertos: 0,
      lider: liderUsuario
        ? { usuario_id: liderUsuario.id, apodo: liderUsuario.apodo || liderUsuario.nombre_visible || "Líder" }
        : null,
    };
    const codigoInv = `SEM${id.slice(0, 6).toUpperCase()}`;
    devStore.clubes.unshift(nuevoClub);
    devStore.clubDetalles[id] = {
      club: {
        id,
        nombre: nuevoClub.nombre,
        descripcion: nuevoClub.descripcion,
        codigo_invitacion: codigoInv,
        activo: true,
        creado_en: ahora,
      },
      miembros: liderUsuario
        ? [
            {
              usuario_id: liderUsuario.id,
              apodo: liderUsuario.apodo || liderUsuario.nombre_visible || "Líder",
              rol_miembro: "lider",
              unido_en: ahora,
              url_avatar: null,
              xp_total: liderUsuario.progreso?.xp_total ?? 0,
              xp_semana: 0,
              actividades_semana: 0,
            },
          ]
        : [],
      retos: [],
    };
    guardarDevStoreEnDisco();
    return {
      status: 201,
      payload: {
        exito: true,
        datos: {
          ...devStore.clubDetalles[id].club,
          lider: nuevoClub.lider ?? { usuario_id: "", apodo: "Administrador" },
        },
      },
    };
  }

  if (pathname.startsWith("/administracion/clubes/")) {
    const parts = pathname.split("/").filter(Boolean);
    const clubId = parts[2];
    const sub = parts[3];
    const subId = parts[4];
    const action = parts[5];
    const club = devStore.clubes.find((c) => c.id === clubId);
    if (club) {
      if (!devStore.clubDetalles[clubId]) {
        devStore.clubDetalles[clubId] = construirClubDetalleBase(club);
      }
      const detalle = devStore.clubDetalles[clubId];

      if (method === "PATCH" && !sub) {
        if (typeof payload.nombre === "string") {
          club.nombre = payload.nombre.trim();
          detalle.club.nombre = club.nombre;
        }
        if ("descripcion" in payload) {
          club.descripcion = payload.descripcion ?? null;
          detalle.club.descripcion = club.descripcion;
        }
        guardarDevStoreEnDisco();
        return { status: 200, payload: { exito: true, datos: detalle.club } };
      }

      if (method === "POST" && sub === "archivar") {
        club.activo = false;
        detalle.club.activo = false;
        guardarDevStoreEnDisco();
        return { status: 200, payload: { exito: true, datos: { archived: true } } };
      }

      if (method === "POST" && sub === "reactivar") {
        club.activo = true;
        detalle.club.activo = true;
        guardarDevStoreEnDisco();
        return { status: 200, payload: { exito: true, datos: { reactivated: true } } };
      }

      if (method === "POST" && sub === "regenerar-codigo") {
        const codigo = `SEM${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        detalle.club.codigo_invitacion = codigo;
        guardarDevStoreEnDisco();
        return { status: 200, payload: { exito: true, datos: { codigo_invitacion: codigo } } };
      }

      if (method === "POST" && sub === "miembros" && typeof payload.usuario_id === "string") {
        const u = devStore.usuarios.find((x) => x.id === payload.usuario_id);
        const yaExiste = detalle.miembros.some((m: any) => m.usuario_id === payload.usuario_id);
        if (!yaExiste) {
          detalle.miembros.push({
            usuario_id: payload.usuario_id,
            apodo: u?.apodo || u?.nombre_visible || "Miembro",
            rol_miembro: "miembro",
            unido_en: ahora,
            url_avatar: null,
            xp_total: u?.progreso?.xp_total ?? 0,
            xp_semana: 0,
            actividades_semana: 0,
          });
          club.miembros = detalle.miembros.length;
        }
        guardarDevStoreEnDisco();
        return { status: 200, payload: { exito: true, datos: { added: true, usuario_id: payload.usuario_id } } };
      }

      if (method === "DELETE" && sub === "miembros" && subId) {
        detalle.miembros = detalle.miembros.filter((m: any) => m.usuario_id !== subId);
        club.miembros = detalle.miembros.length;
        guardarDevStoreEnDisco();
        return { status: 200, payload: { exito: true, datos: { removed: true } } };
      }

      if (method === "POST" && sub === "transferir-liderazgo" && typeof payload.usuario_id === "string") {
        let nuevoLiderApodo = "Líder";
        detalle.miembros = detalle.miembros.map((m: any) => {
          if (m.usuario_id === payload.usuario_id) {
            nuevoLiderApodo = m.apodo || nuevoLiderApodo;
            return { ...m, rol_miembro: "lider" };
          }
          return m.rol_miembro === "lider" ? { ...m, rol_miembro: "miembro" } : m;
        });
        club.lider = { usuario_id: payload.usuario_id, apodo: nuevoLiderApodo };
        guardarDevStoreEnDisco();
        return { status: 200, payload: { exito: true, datos: { transferred: true, usuario_id: payload.usuario_id } } };
      }

      if (method === "POST" && sub === "retos" && !subId) {
        const retoId = crypto.randomUUID();
        detalle.retos.unshift({
          id: retoId,
          nombre: String(payload.nombre || "Nuevo reto"),
          descripcion: payload.descripcion ?? null,
          codigo_metrica: String(payload.codigo_metrica || "actividades_completadas"),
          valor_objetivo: Number(payload.valor_objetivo) || 10,
          xp_reto: Number(payload.xp_reto) || 50,
          fecha_inicio: String(payload.fecha_inicio || ahora),
          fecha_fin: String(payload.fecha_fin || ahora),
        });
        club.retos_abiertos = detalle.retos.length;
        guardarDevStoreEnDisco();
        return { status: 201, payload: { exito: true, datos: { id: retoId } } };
      }

      if (method === "POST" && sub === "retos" && subId && action === "cerrar") {
        detalle.retos = detalle.retos.filter((r: any) => r.id !== subId);
        club.retos_abiertos = detalle.retos.length;
        guardarDevStoreEnDisco();
        return { status: 200, payload: { exito: true, datos: { closed: true } } };
      }
    }
  }

  if (method === "PATCH" && pathname.startsWith("/administracion/reportes-clubes/")) {
    const repId = pathname.split("/").filter(Boolean)[2];
    const rep = devStore.reportesClubes.find((r) => r.id === repId);
    if (rep) {
      if (payload.estado) rep.estado = payload.estado;
      if ("nota" in payload) rep.nota = payload.nota;
      guardarDevStoreEnDisco();
      return { status: 200, payload: { exito: true, datos: rep } };
    }
  }

  // 8. Logros CRUD & archivar/reactivar
  if (method === "POST" && pathname === "/administracion/logros") {
    const id = crypto.randomUUID();
    const nuevoLogro = {
      id,
      codigo: String(payload.codigo || `logro_${id.slice(0, 6)}`).trim(),
      nombre: String(payload.nombre || "Nuevo logro").trim(),
      titulo: String(payload.nombre || "Nuevo logro").trim(),
      descripcion: payload.descripcion ?? null,
      url_icono: payload.url_icono ?? null,
      icono_url: payload.url_icono ?? null,
      bono_xp: Number(payload.bono_xp) || 25,
      xp_recompensa: Number(payload.bono_xp) || 25,
      codigo_criterio: String(payload.codigo_criterio || "temas_completados"),
      valor_criterio: Number(payload.valor_criterio) || 1,
      activo: true,
      creado_en: ahora,
      actualizado_en: ahora,
      otorgados: 0,
      otorgados_count: 0,
    };
    devStore.logros.unshift(nuevoLogro);
    guardarDevStoreEnDisco();
    return { status: 201, payload: { exito: true, datos: nuevoLogro } };
  }

  if (pathname.startsWith("/administracion/logros/")) {
    const parts = pathname.split("/").filter(Boolean);
    const logroId = parts[2];
    const action = parts[3];
    const logro = devStore.logros.find((l) => l.id === logroId);
    if (logro) {
      if (method === "PATCH" && !action) {
        Object.assign(logro, {
          ...payload,
          titulo: payload.nombre ?? logro.nombre,
          icono_url: "url_icono" in payload ? payload.url_icono : logro.icono_url,
          xp_recompensa: payload.bono_xp ?? logro.xp_recompensa,
          actualizado_en: ahora,
        });
        guardarDevStoreEnDisco();
        return { status: 200, payload: { exito: true, datos: logro } };
      }
      if (method === "POST" && action === "archivar") {
        logro.activo = false;
        logro.actualizado_en = ahora;
        guardarDevStoreEnDisco();
        return { status: 200, payload: { exito: true, datos: { archived: true } } };
      }
      if (method === "POST" && action === "reactivar") {
        logro.activo = true;
        logro.actualizado_en = ahora;
        guardarDevStoreEnDisco();
        return { status: 200, payload: { exito: true, datos: { reactivated: true } } };
      }
    }
  }

  // 9. Usuarios invitar / menor / crear / actualizar / acciones masivas
  if (method === "POST" && (pathname === "/administracion/usuarios/invitar" || pathname === "/administracion/usuarios/cuenta" || pathname === "/administracion/usuarios/menores" || pathname === "/administracion/usuarios")) {
    const id = crypto.randomUUID();
    const esMenor = pathname === "/administracion/usuarios/menores";
    const grupoObj = SNAPSHOT_USUARIOS.datos.catalogos.grupos_edad.find((g) => g.id === payload.grupo_edad_id) ?? null;
    const clubObj = devStore.clubes.find((c) => c.id === payload.club_id) ?? null;
    const nuevoUsuario = {
      id,
      nombre_visible: String(payload.nombre_visible || payload.apodo || "Nuevo usuario").trim(),
      correo: payload.correo ? String(payload.correo).trim() : null,
      rol: esMenor ? "usuario" : String(payload.rol || "usuario"),
      apodo: String(payload.apodo || payload.nombre_visible || "Nuevo").trim(),
      proveedor: esMenor ? "menor" : "correo",
      activo: true,
      estado: pathname === "/administracion/usuarios/invitar" ? "pendiente" : "activo",
      creado_en: ahora,
      actualizado_en: ahora,
      ultimo_acceso: null,
      ultimo_login_en: null,
      perfil: {
        id: `perfil-${id.slice(0, 8)}`,
        apodo: String(payload.apodo || payload.nombre_visible || "Nuevo").trim(),
        avatar_url: null,
        clave_avatar: null,
        grupo_edad_id: grupoObj?.id ?? null,
        prefiere_audio: true,
        tamano_texto_preferido: "mediano",
      },
      grupo_edad: grupoObj,
      clubes: clubObj ? [{ id: clubObj.id, nombre: clubObj.nombre, rol_miembro: "miembro", unido_en: ahora }] : [],
      vinculos_familiares: payload.tutor_id ? 1 : 0,
      progreso: { xp_total: 0, eventos: 0 },
    };
    devStore.usuarios.unshift(nuevoUsuario);
    guardarDevStoreEnDisco();
    if (esMenor) {
      return {
        status: 201,
        payload: {
          exito: true,
          datos: {
            usuario: nuevoUsuario,
            credencial_temporal: { usuario_id: id, token: `SEM-${id.slice(0, 6).toUpperCase()}` },
          },
        },
      };
    }
    return { status: 201, payload: { exito: true, datos: nuevoUsuario } };
  }

  if (method === "POST" && pathname === "/administracion/usuarios/acciones") {
    const ids = Array.isArray(payload.usuario_ids) ? payload.usuario_ids : [];
    const accion = String(payload.accion || "activar");
    let actualizados = 0;
    for (const u of devStore.usuarios) {
      if (ids.includes(u.id)) {
        u.activo = accion === "activar";
        u.estado = accion === "activar" ? "activo" : "bloqueado";
        u.actualizado_en = ahora;
        actualizados += 1;
      }
    }
    guardarDevStoreEnDisco();
    return { status: 200, payload: { exito: true, datos: { actualizados } } };
  }

  if (pathname.startsWith("/administracion/usuarios/")) {
    const userId = pathname.split("/").filter(Boolean)[2];
    const usuario = devStore.usuarios.find((u) => u.id === userId);
    if (usuario) {
      if (method === "PATCH") {
        Object.assign(usuario, { ...payload, id: usuario.id, actualizado_en: ahora });
        if ("activo" in payload) {
          usuario.estado = payload.activo ? "activo" : "bloqueado";
        }
        guardarDevStoreEnDisco();
        return { status: 200, payload: { exito: true, datos: usuario } };
      }
      if (method === "DELETE") {
        usuario.activo = false;
        usuario.estado = "bloqueado";
        usuario.actualizado_en = ahora;
        guardarDevStoreEnDisco();
        return { status: 200, payload: { exito: true, datos: { desactivado: true } } };
      }
    }
  }

  // 10. Ajustes de plataforma
  if ((method === "PATCH" || method === "PUT") && (pathname === "/administracion/ajustes-plataforma" || pathname === "/administracion/ajustes")) {
    Object.assign(devStore.ajustes, payload, { actualizado_en: ahora });
    if (devStore.ajustes.ajustes && typeof devStore.ajustes.ajustes === "object") {
      Object.assign(devStore.ajustes.ajustes, payload);
    }
    guardarDevStoreEnDisco();
    return { status: 200, payload: { exito: true, datos: devStore.ajustes } };
  }

  return null;
}

// Pre-cargar snapshots para resiliencia en desarrollo
registrarSnapshot("/administracion/resumen/detallado", construirResumenDetalladoDev());
registrarSnapshot("/perfil", SNAPSHOT_PERFIL_ADMIN);
registrarSnapshot("/administracion/temas-listado", SNAPSHOT_TEMAS_LISTADO);
registrarSnapshot("/administracion/temas", { exito: true, datos: devStore.temas });
registrarSnapshot("/administracion/usuarios", SNAPSHOT_USUARIOS);
registrarSnapshot("/administracion/actividades", { exito: true, datos: { actividades: devStore.actividades, total: devStore.actividades.length } });
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
            capitulo: Number(vc.capitulo) || 1,
            versiculo_inicio: Number(vc.versiculo_inicio ?? vc.versiculo) || 1,
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

      // Manejar publicación directa o envío a revisión de temas delegando al estado local en caso de auth/error remoto
      if (
        res.status >= 400 &&
        req.method === "POST" &&
        url.pathname.startsWith("/administracion/temas/") &&
        (url.pathname.endsWith("/publicar") || url.pathname.endsWith("/enviar-revision") || url.pathname.endsWith("/resolver-revision"))
      ) {
        const resultado = aplicarMutacionDev(req.method, url.pathname, parsedRequestJson);
        if (resultado) {
          console.log(`[PROXY DEV RESILIENCE] Acción editorial aplicada en estado local para ${url.pathname}`);
          return new Response(JSON.stringify(resultado.payload), {
            status: resultado.status,
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

      // Resiliencia para desarrollo: Si el worker remoto responde 401/403/5xx en endpoints de administración o perfil,
      // o si es una petición con token admin a /perfil, servir estado persistido/filtrado de desarrollo
      if (
        ((res.status === 401 || res.status === 403 || res.status >= 500) &&
          req.method === "GET" &&
          (url.pathname.startsWith("/administracion") || url.pathname === "/perfil")) ||
        (url.pathname === "/perfil" && authHeader && authHeader.startsWith("Bearer ") && res.status !== 200)
      ) {
        const dynamicPayload = filtrarYResponderGetDev(url);
        let cached: Uint8Array | undefined = dynamicPayload
          ? new TextEncoder().encode(JSON.stringify(dynamicPayload))
          : undefined;

        if (!cached) {
          cached = cacheGet.get(url.pathname);
        }

        if (!cached) {
          if (url.pathname.startsWith("/administracion/clubes/")) {
            cached = new TextEncoder().encode(JSON.stringify(SNAPSHOT_CLUB_DETALLE));
          } else if (url.pathname.startsWith("/administracion/logros/")) {
            cached = new TextEncoder().encode(JSON.stringify({ exito: true, datos: SNAPSHOT_LOGROS.datos.logros[0] }));
          } else if (url.pathname.startsWith("/administracion/usuarios/")) {
            const userId = url.pathname.split("/")[3] || SNAPSHOT_USUARIOS.datos.usuarios[0].id;
            const baseUser = SNAPSHOT_USUARIOS.datos.usuarios.find((u) => u.id === userId) ?? SNAPSHOT_USUARIOS.datos.usuarios[0];
            cached = new TextEncoder().encode(
              JSON.stringify({
                exito: true,
                datos: {
                  ...baseUser,
                  id: userId,
                  vinculos: [],
                  estadisticas: {
                    temas_total: 4,
                    temas_completados: 2,
                    actividades_total: 12,
                    actividades_completadas: 8,
                    intentos: 10,
                    xp_total: baseUser.progreso?.xp_total ?? 420,
                  },
                  actividad_reciente: [
                    {
                      id: "ev-1",
                      tipo: "actividad_completada",
                      tema_id: "47a2e22f-86da-466f-92ff-1847d85de609",
                      actividad_id: "act-1",
                      puntaje: 100,
                      correcta: true,
                      xp_otorgada: 20,
                      ocurrido_en: "2026-10-30T16:30:00Z",
                    },
                  ],
                  auditoria: [
                    {
                      id: "aud-1",
                      accion: "login",
                      datos_antes: null,
                      datos_despues: null,
                      actor_usuario_id: userId,
                      creado_en: "2026-10-30T17:00:00Z",
                    },
                  ],
                },
              })
            );
          }
        }
        if (cached) {
          console.log(`[PROXY DEV RESILIENCE] Sirviendo estado filtrado en desarrollo para ${url.pathname}${url.search} (remote respondió ${res.status})`);
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

      // Emular mutaciones persistentes en desarrollo si el backend remoto responde error de auth/red
      if (
        (res.status === 401 || res.status === 403 || res.status >= 500) &&
        req.method !== "GET" &&
        url.pathname.startsWith("/administracion")
      ) {
        console.log(`[PROXY DEV RESILIENCE] Aplicando mutación persistente para ${req.method} ${url.pathname}`);
        const resultado = aplicarMutacionDev(req.method, url.pathname, parsedRequestJson);
        if (resultado) {
          return new Response(JSON.stringify(resultado.payload), {
            status: resultado.status,
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
      if (req.method === "GET") {
        const dynamicPayload = filtrarYResponderGetDev(url);
        const cached = dynamicPayload ? new TextEncoder().encode(JSON.stringify(dynamicPayload)) : cacheGet.get(url.pathname);
        if (cached) {
          console.log(`[PROXY DEV RESILIENCE] Red caída, sirviendo estado local para ${url.pathname}${url.search}`);
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
      } else if (url.pathname.startsWith("/administracion")) {
        const resultado = aplicarMutacionDev(req.method, url.pathname, parsedRequestJson);
        if (resultado) {
          return new Response(JSON.stringify(resultado.payload), {
            status: resultado.status,
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
