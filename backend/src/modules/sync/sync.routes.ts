import { Hono } from "hono";
import type { Context } from "hono";
import type { AppBindings } from "../../config/env";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { zValidator } from "../../shared/middleware/validate.middleware";
import { responderExito } from "../../shared/http/respuesta";
import { syncPullQuerySchema, syncPushBodySchema } from "./sync.schemas";
import { crearSyncRepository, type SyncRepository } from "./sync.repository";
import { crearCasoObtenerSyncPull } from "./casos-uso/obtener-sync-pull";
import { crearCasoProcesarSyncPush } from "./casos-uso/procesar-sync-push";
import type { ModuloDependencias } from "../../shared/types/modulo";

type SyncDependencias = ModuloDependencias & {
  repositorio?: SyncRepository;
};

export function crearModuloSync({
  db,
  authMiddleware: middlewareAutenticacion = authMiddleware,
  repositorio
}: SyncDependencias = {}) {
  const syncRoutes = new Hono<AppBindings>();

  function obtenerRepositorio(c: Context<AppBindings>) {
    if (repositorio) return repositorio;
    const cliente = db ?? c.get("drizzle");
    if (!cliente) throw new Error("Cliente Drizzle no disponible");
    return crearSyncRepository({ db: cliente });
  }

  syncRoutes.use("*", middlewareAutenticacion);

  syncRoutes.get(
    "/pull",
    zValidator("query", syncPullQuerySchema),
    async (c) => {
      const user = c.get("user");
      const { since } = c.req.valid("query");
      const repo = obtenerRepositorio(c);
      const obtenerSyncPull = crearCasoObtenerSyncPull({ repositorio: repo });
      const datos = await obtenerSyncPull(user.id, since);

      return responderExito(datos);
    }
  );

  syncRoutes.post(
    "/push",
    zValidator("json", syncPushBodySchema),
    async (c) => {
      const user = c.get("user");
      const { eventos } = c.req.valid("json");
      const repo = obtenerRepositorio(c);
      const procesarSyncPush = crearCasoProcesarSyncPush({ repositorio: repo });
      const resultado = await procesarSyncPush(user.id, eventos);

      return responderExito(resultado, resultado.procesados > 0 ? 201 : 200);
    }
  );

  return syncRoutes;
}

export const syncRoutes = crearModuloSync();
