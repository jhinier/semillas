/**
 * ============================================================
 * PUNTO DE ENTRADA DE LA API - SEMILLAS
 * ============================================================
 *
 * Este archivo configura la aplicación Hono con:
 * - Middlewares (CORS, logger, manejo de errores)
 * - Rutas de la API
 * - Documentación OpenAPI con Scalar
 * - Health check
 *
 * La API sigue el patrón de respuestas:
 * - Éxito: { exito: true, datos: {...} }
 * - Error: { exito: false, error: "mensaje", codigo?: "CODIGO" }
 *
 * @module app
 */

import { Hono } from "hono";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { AppBindings } from "./config/env";
import { APP_NAME, APP_VERSION } from "./config/constants";
import { createSupabaseAdmin, crearDb } from "./db/client";
import { openApiSpec } from "./openapi/spec";
import { errorHandler } from "./shared/middleware/error-handler";
import { requestIdMiddleware } from "./shared/middleware/request-id.middleware";
import { crearRateLimitMiddleware } from "./shared/middleware/rate-limit.middleware";

/**
 * Rutas de la API
 * Cada módulo maneja un grupo de endpoints relacionados
 */
import { authRoutes } from "./modules/auth";
import { crearModuloCatalogo } from "./modules/catalog";
import { crearModuloSendas } from "./modules/sendas";
import { themesRoutes } from "./modules/themes";
import { crearModuloUsuarios } from "./modules/users";
import { progressRoutes } from "./modules/progress";
import { activitiesRoutes } from "./modules/activities";
import { adminRoutes } from "./modules/admin";
import { clubsRoutes } from "./modules/clubs";
import { adminClubsRoutes } from "./modules/clubs/admin-clubs.routes";
import { moderationRoutes } from "./modules/clubs/moderation.routes";
import { gamificationRoutes, adminLogrosRoutes } from "./modules/gamification";
import { mediaRoutes } from "./modules/media";
import { crearModuloSync } from "./modules/sync";

/**
 * Aplicación principal de Hono
 * @see https://hono.dev/
 */
const app = new Hono<AppBindings>();

/**
 * ============================================================
 * MIDDLEWARES GLOBALES
 * ============================================================
 */

/**
 * Logger para todas las peticiones
 * Muestra método, ruta, status y tiempo de respuesta
 */
app.use("*", logger());
app.use("*", requestIdMiddleware());

/**
 * Configuración de CORS
 * Permite peticiones desde el frontend y apps móviles
 */
app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const baseDomain = c.env.CORS_BASE_DOMAIN.trim().toLowerCase();

      if (!origin) return `https://${baseDomain}`;

      const esDesarrollo = c.env.APP_ENV !== "production";
      const esLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (esDesarrollo && esLocal) return origin;

      try {
        const url = new URL(origin);
        const hostname = url.hostname.toLowerCase();
        const allowed =
          url.protocol === "https:" &&
          (hostname === baseDomain || hostname.endsWith(`.${baseDomain}`));
        return allowed ? origin : "";
      } catch {
        return "";
      }
    },
    allowHeaders: ["Content-Type", "Authorization", "X-Guest-User-Id", "X-Guest-Token", "X-Dev-Setup-Token", "Cache-Control", "Pragma"],
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  })
);

const limitarPublico = crearRateLimitMiddleware("publico");
const limitarAutenticado = crearRateLimitMiddleware("autenticado");
const limitarSensible = crearRateLimitMiddleware("sensible");
app.use("*", async (c, next) => {
  const ruta = new URL(c.req.url).pathname;
  const sensible = ruta === "/autenticacion/invitado" || ruta.includes("/vincular-cuenta") || ruta === "/media/subir" || ruta.startsWith("/administracion");
  const autenticado = !sensible && (c.req.header("authorization") || c.req.header("x-guest-user-id"));
  return (sensible ? limitarSensible : autenticado ? limitarAutenticado : limitarPublico)(c, next);
});

/**
 * Middleware que inyecta el cliente de Supabase en el contexto
 * Usado por los módulos legacy que aún usan Supabase JS directamente
 *
 * NOTA: Los nuevos módulos deben usar Drizzle importando `db` desde db/client.ts
 * Este cliente de Supabase se mantiene para:
 * - Auth (crear usuarios, etc.)
 * - Storage (subir archivos)
 * - Edge functions de Supabase
 */
app.use("*", async (c, next) => {
  c.set("db", createSupabaseAdmin(c.env));
  if (c.env.HYPERDRIVE || c.env.SUPABASE_DATABASE_URL) {
    c.set("drizzle", crearDb(c.env));
  }
  await next();
});

/**
 * ============================================================
 * ENDPOINTS PÚBLICOS
 * ============================================================
 */

/**
 * GET /
 *
 * Información básica de la API
 */
app.get("/", (c) => {
  return c.json({
    exito: true,
    datos: {
      nombre: APP_NAME,
      version: APP_VERSION
    }
  });
});

/**
 * GET /openapi.json
 *
 * Especificación OpenAPI 3.0 en formato JSON
 * Usada por Scalar para generar la documentación
 */
app.get("/openapi.json", (c) => {
  return c.json(openApiSpec);
});

/**
 * GET /docs
 *
 * Documentación interactiva de la API usando Scalar
 * Accesible desde el navegador en entorno de desarrollo
 */
app.get(
  "/docs",
  Scalar({
    spec: { url: "/openapi.json" },
    theme: "kepler",
    layout: "modern",
    defaultHttpClient: { targetKey: "javascript", clientKey: "fetch" },
    metaData: { title: `${APP_NAME} — API Docs` }
  })
);

/**
 * GET /health
 *
 * Endpoint de salud para verificar que el servicio está activo
 * Útil para load balancers y monitoring
 */
app.get("/health", (c) => {
  return c.json({
    exito: true,
    datos: {
      estado: "healthy",
      entorno: c.env.APP_ENV
    }
  });
});

/**
 * ============================================================
 * REGISTRO DE RUTAS
 * ============================================================
 * Cada módulo se monta en una ruta base:
 * - /autenticacion - Login y registro
 * - /catalogo - Catálogos estáticos (grupos de edad, tipos de actividad, etc.)
 * - /sendas - Sendas espirituales (Padre, Hijo, Espíritu Santo)
 * - /temas - Temas bíblicos
 * - /perfil - Perfil del usuario
 * - /progreso - Progreso y eventos
 * - /actividades - Actividades y quiz
 * - /administracion - CMS para admins
 * - /clubes - Clubes y retos cooperativos
 * - /gamificacion - Logros, niveles y XP
 * - /media - Carga y gestión de archivos
 * - /sync - Sincronización offline
 */

app.route("/autenticacion", authRoutes);
app.route("/catalogo", crearModuloCatalogo());
app.route("/sendas", crearModuloSendas());
app.route("/temas", themesRoutes);
app.route("/perfil", crearModuloUsuarios());
app.route("/progreso", progressRoutes);
app.route("/actividades", activitiesRoutes);
app.route("/administracion", adminRoutes);
app.route("/administracion/clubes", adminClubsRoutes);
app.route("/administracion", moderationRoutes);
app.route("/clubes", clubsRoutes);
app.route("/gamificacion", gamificationRoutes);
app.route("/administracion/logros", adminLogrosRoutes);
app.route("/media", mediaRoutes);
app.route("/sync", crearModuloSync());

/**
 * ============================================================
 * MANEJO DE ERRORES
 * ============================================================
 * El handler de errores captura excepciones y las convierte
 * a respuestas JSON consistentes
 */
app.onError(errorHandler);

export default app;
