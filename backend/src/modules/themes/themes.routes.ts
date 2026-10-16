import { Hono } from "hono";
import type { Context } from "hono";
import type { MiddlewareHandler } from "hono";
import type { AppBindings } from "../../config/env";
import { createSupabaseAdmin, type DbClient } from "../../db/client";
import { NotFoundError } from "../../shared/errors/http-error";
import { responderError, responderExito } from "../../shared/http/respuesta";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { crearThemesRepository } from "./themes.repository";
import { crearThemesService } from "./themes.service";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Dependencias = {
  db?: DbClient;
  createSupabaseAdmin?: typeof createSupabaseAdmin;
  authMiddleware?: MiddlewareHandler<AppBindings>;
};

export function crearModuloThemes({
  db,
  createSupabaseAdmin: crearAdmin = createSupabaseAdmin,
  authMiddleware: middlewareAutenticacion = authMiddleware,
}: Dependencias = {}) {
  const themesRoutes = new Hono<AppBindings>();

  function obtenerServicio(c: Context<AppBindings>) {
    const cliente = db ?? c.get("drizzle");
    if (!cliente) throw new Error("Cliente Drizzle no disponible");
    const repositorio = crearThemesRepository(cliente);
    return crearThemesService({ themes: repositorio, crearSupabaseAdmin: crearAdmin });
  }

  themesRoutes.get("/", async (c) => {
    const sendaId = c.req.query("senda_id") ?? undefined;
    return responderExito(await obtenerServicio(c).listarTemasPublicos(sendaId));
  });

  themesRoutes.post("/:tema_id/paquete-offline", middlewareAutenticacion, async (c) => {
    const temaId = c.req.param("tema_id");

    if (!UUID_REGEX.test(temaId)) {
      return responderError("El ID del tema debe ser un UUID válido", "VALIDATION_ERROR", 400);
    }

    const body: { grupo_edad_id?: string } = await c.req.json<{ grupo_edad_id?: string }>().catch(() => ({}));
    if (!body.grupo_edad_id || !UUID_REGEX.test(body.grupo_edad_id)) {
      return responderError("El grupo de edad es obligatorio", "VALIDATION_ERROR", 400);
    }

    const usuario = c.get("user");
    const paquete = await obtenerServicio(c).crearPaqueteOffline(c.env, usuario.id, temaId, body.grupo_edad_id);

    if (!paquete) {
      throw new NotFoundError("Tema no encontrado");
    }

    return responderExito(paquete);
  });

  themesRoutes.get("/:tema_id/portada", async (c) => {
    const temaId = c.req.param("tema_id");

    if (!UUID_REGEX.test(temaId)) {
      return responderError("El ID del tema debe ser un UUID válido", "VALIDATION_ERROR", 400);
    }

    const portada = await obtenerServicio(c).obtenerPortadaTema(c.env, temaId);

    if (!portada) {
      throw new NotFoundError("El tema no tiene portada activa");
    }

    return responderExito({
      url: portada.url,
      expira_en_segundos: portada.expira_en_segundos
    });
  });

  themesRoutes.get("/:tema_id", async (c) => {
    const temaId = c.req.param("tema_id");
    const tema = await obtenerServicio(c).obtenerTemaPublico(temaId);

    if (!tema) {
      throw new NotFoundError("Tema no encontrado");
    }

    return responderExito(tema);
  });

  themesRoutes.get("/:tema_id/pasos", async (c) => {
    const temaId = c.req.param("tema_id");
    const grupoEdadId = c.req.query("grupo_edad_id") ?? undefined;
    return responderExito(await obtenerServicio(c).listarPasosTema(temaId, grupoEdadId));
  });

  themesRoutes.get("/:tema_id/actividades", async (c) => {
    const temaId = c.req.param("tema_id");
    const grupoEdadId = c.req.query("grupo_edad_id") ?? undefined;
    return responderExito(await obtenerServicio(c).listarActividadesTema(temaId, grupoEdadId));
  });

  return themesRoutes;
}

export const themesRoutes = crearModuloThemes();
