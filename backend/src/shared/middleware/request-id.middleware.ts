import { createMiddleware } from "hono/factory";
import type { AppBindings } from "../../config/env";

export const requestIdMiddleware = () =>
  createMiddleware<AppBindings>(async (c, next) => {
    const requestId = c.req.header("x-request-id")?.trim() || crypto.randomUUID();

    c.set("requestId", requestId);
    c.header("x-request-id", requestId);

    await next();
  });
