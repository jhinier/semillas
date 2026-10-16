import { Hono } from "hono";
import type { Context } from "hono";
import type { AppBindings } from "../../config/env";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { responderExito, responderError } from "../../shared/http/respuesta";
import { crearGamificationRepository } from "./gamification.repository";
import { crearCasoObtenerMiGamificacion } from "./casos-uso/obtener-mi";

export const gamificationRoutes = new Hono<AppBindings>();

gamificationRoutes.use("*", authMiddleware);

function obtenerRepositorio(c: Context<AppBindings>) {
  const cliente = c.get("drizzle");
  if (!cliente) throw new Error("Cliente Drizzle no disponible");
  return crearGamificationRepository(cliente);
}

// GET /gamificacion/mi — Nivel, logros y cantidad de pendientes de reclamar
gamificationRoutes.get("/mi", async (c) => {
  const repositorio = obtenerRepositorio(c);
  const servicio = crearCasoObtenerMiGamificacion(repositorio);
  return responderExito(await servicio(c.get("user").id));
});

// POST /gamificacion/logros/:logroId/reclamar — Reclama un logro y otorga XP
gamificationRoutes.post("/logros/:logroId/reclamar", async (c) => {
  const { logroId } = c.req.param();
  const usuarioId = c.get("user").id;
  const repositorio = obtenerRepositorio(c);

  try {
    const resultado = await repositorio.reclamarLogro(usuarioId, logroId);

    if (!resultado) {
      return responderError("Logro no encontrado o no pertenece al usuario", "NOT_FOUND", 404);
    }

    return responderExito({
      reclamado: true,
      bono_xp: resultado.bonoXp,
      nombre: resultado.nombre,
    });
  } catch (error) {
    console.error("[RECLAMAR LOGRO] Error al reclamar logro:", {
      logroId,
      usuarioId,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    });
    return responderError("Error al procesar la reclamación del logro", "INTERNAL_ERROR", 500);
  }
});
