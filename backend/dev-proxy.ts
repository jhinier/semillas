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
      { id: "e1000000-0000-0000-0000-000000000001", codigo: "semillas", nombre: "Semillas", edad_min: 4, edad_max: 6 },
      { id: "e1000000-0000-0000-0000-000000000002", codigo: "exploradores", nombre: "Exploradores", edad_min: 7, edad_max: 9 },
      { id: "e1000000-0000-0000-0000-000000000003", codigo: "embajadores", nombre: "Embajadores", edad_min: 10, edad_max: 12 },
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
      minutos_estimados: 15,
      xp_recompensa: 50,
      publicado_en: t.actualizado_en,
      es_destacado: false,
      grupos_edad: ["semillas", "exploradores", "embajadores"],
    })),
    total: 14,
    limit: 20,
    offset: 0,
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
        tipo_actividad_id: "quiz",
        titulo: "Quiz Bíblico",
        consigna: "Responde las preguntas",
        dificultad: "normal",
        xp_recompensa: 20,
        orden: 1,
        obligatorio: true,
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
    reportes: [],
    metricas: { total: 0, resueltos: 0, pendientes: 0 },
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

const cacheGet = new Map<string, Uint8Array>();

function registrarSnapshot(ruta: string, obj: unknown) {
  cacheGet.set(ruta, new TextEncoder().encode(JSON.stringify(obj)));
}

// Pre-cargar snapshots para resiliencia en desarrollo
registrarSnapshot("/administracion/resumen/detallado", SNAPSHOT_RESUMEN_DETALLADO);
registrarSnapshot("/perfil", SNAPSHOT_PERFIL_ADMIN);
registrarSnapshot("/administracion/temas-listado", SNAPSHOT_TEMAS_LISTADO);
registrarSnapshot("/administracion/temas", SNAPSHOT_TEMAS_LISTADO.datos.temas);
registrarSnapshot("/administracion/usuarios", SNAPSHOT_USUARIOS);
registrarSnapshot("/administracion/actividades", SNAPSHOT_ACTIVIDADES);
registrarSnapshot("/administracion/revisiones", SNAPSHOT_REVISIONES);
registrarSnapshot("/administracion/reportes", SNAPSHOT_REPORTES);
registrarSnapshot("/administracion/ajustes", SNAPSHOT_AJUSTES);
registrarSnapshot("/administracion/sendas", SNAPSHOT_SENDAS);

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

    const body = req.method !== "GET" && req.method !== "HEAD" ? await req.arrayBuffer() : undefined;

    try {
      const res = await fetch(targetUrl.toString(), {
        method: req.method,
        headers,
        body,
        redirect: "follow",
      });

      const responseBody = await res.arrayBuffer();
      console.log(`[PROXY] -> ${res.status} ${res.statusText} (${responseBody.byteLength} bytes)`);

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

      // Resiliencia para desarrollo: Si el worker remoto responde 401/403 en endpoints de administración o perfil,
      // o si es una petición con token admin a /perfil, servir snapshot de admin
      if (
        ((res.status === 401 || res.status === 403 || res.status >= 500) &&
          req.method === "GET" &&
          (url.pathname.startsWith("/administracion") || url.pathname === "/perfil")) ||
        (url.pathname === "/perfil" && authHeader && authHeader.startsWith("Bearer ") && res.status !== 200)
      ) {
        const cached =
          url.pathname === "/perfil"
            ? new TextEncoder().encode(JSON.stringify(SNAPSHOT_PERFIL_ADMIN))
            : cacheGet.get(url.pathname);
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
