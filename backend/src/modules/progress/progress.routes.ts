import { Hono } from "hono";
import type { Context } from "hono";
import type { AppBindings } from "../../config/env";
import { responderExito } from "../../shared/http/respuesta";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { zValidator } from "../../shared/middleware/validate.middleware";
import { progressEventSchema } from "./progress.schemas";
import { crearProgressRepository } from "./progress.repository";
import { crearCasoObtenerMiProgreso } from "./casos-uso/obtener-mi-progreso";
import { crearCasoRegistrarEvento } from "./casos-uso/registrar-evento";
import type { ModuloDependencias } from "../../shared/types/modulo";

export function crearModuloProgress({
  db,
  authMiddleware: middlewareAutenticacion = authMiddleware
}: ModuloDependencias = {}) {
  const progressRoutes = new Hono<AppBindings>();

  function obtenerRepositorio(c: Context<AppBindings>) {
    const cliente = db ?? c.get("drizzle");
    if (!cliente) throw new Error("Cliente Drizzle no disponible");
    return crearProgressRepository(cliente);
  }

  progressRoutes.use("*", middlewareAutenticacion);

  progressRoutes.get("/mi", async (c) => {
    const user = c.get("user");
    const progreso = obtenerRepositorio(c);
    const obtenerMiProgreso = crearCasoObtenerMiProgreso({ progreso });
    return responderExito(await obtenerMiProgreso(user.id));
  });

  progressRoutes.post(
    "/eventos",
    zValidator("json", progressEventSchema),
    async (c) => {
      const user = c.get("user");
      const body = c.req.valid("json");
      const progreso = obtenerRepositorio(c);
      const registrarEvento = crearCasoRegistrarEvento({ progreso });
      const resultado = await registrarEvento(user.id, body);

      return responderExito(resultado, resultado.duplicado ? 200 : 201);
    }
  );

  return progressRoutes;
}

export const progressRoutes = crearModuloProgress();
