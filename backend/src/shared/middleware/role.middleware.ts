import { createMiddleware } from "hono/factory";
import type { AppBindings, UserRole } from "../../config/env";
import { ForbiddenError, UnauthorizedError } from "../errors/http-error";

export function requireRole(...roles: UserRole[]) {
  return createMiddleware<AppBindings>(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      throw new UnauthorizedError();
    }

    if (!roles.includes(user.role)) {
      throw new ForbiddenError("No tienes permisos para esta acción");
    }

    await next();
  });
}
