import { Hono } from "hono";
import type { Context } from "hono";
import type { AppBindings } from "../../config/env";
import { responderExito } from "../../shared/http/respuesta";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { zValidator } from "../../shared/middleware/validate.middleware";
import { responderActividadSchema } from "./activities.schemas";
import { crearActivitiesRepository } from "./activities.repository";
import { crearCasoListarActividades } from "./casos-uso/listar-actividades";
import { crearCasoObtenerActividad } from "./casos-uso/obtener-actividad";
import { crearCasoResponderActividad } from "./casos-uso/responder-actividad";
import type { ModuloDependencias } from "../../shared/types/modulo";

export function crearModuloActivities({
  db,
  authMiddleware: middlewareAutenticacion = authMiddleware
}: ModuloDependencias = {}) {
  const activitiesRoutes = new Hono<AppBindings>();

  function obtenerRepositorio(c: Context<AppBindings>) {
    const cliente = db ?? c.get("drizzle");
    if (!cliente) throw new Error("Cliente Drizzle no disponible");
    return crearActivitiesRepository(cliente);
  }

  activitiesRoutes.get("/", async (c) => {
    const actividades = obtenerRepositorio(c);
    const listarActividades = crearCasoListarActividades({ actividades });
    return responderExito(await listarActividades());
  });

  activitiesRoutes.get("/:actividad_id", async (c) => {
    const actividades = obtenerRepositorio(c);
    const obtenerActividad = crearCasoObtenerActividad({ actividades });
    return responderExito(await obtenerActividad(c.req.param("actividad_id")));
  });

  activitiesRoutes.post(
    "/:actividad_id/responder",
    middlewareAutenticacion,
    zValidator("json", responderActividadSchema),
    async (c) => {
      const usuario = c.get("user");
      const actividadId = c.req.param("actividad_id");
      const cuerpo = c.req.valid("json");
      const actividades = obtenerRepositorio(c);
      const responderActividad = crearCasoResponderActividad({ actividades });

      const resultado = await responderActividad(usuario, actividadId, cuerpo);
      return responderExito(resultado, resultado.duplicado ? 200 : 201);
    }
  );

  return activitiesRoutes;
}

export const activitiesRoutes = crearModuloActivities();
