import type { MiddlewareHandler } from "hono";
import type { AppBindings } from "../../config/env";
import type { DbClient } from "../../db/client";

export type ModuloDependencias = {
  db?: DbClient;
  authMiddleware?: MiddlewareHandler<AppBindings>;
};
