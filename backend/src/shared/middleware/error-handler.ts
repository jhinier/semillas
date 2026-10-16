import type { ErrorHandler } from "hono";
import { HttpError } from "../errors/http-error";
import { ErrorAplicacion } from "../errores/error-aplicacion";
import { responderError } from "../http/respuesta";

export const errorHandler: ErrorHandler = (err, c) => {
  const causa = err instanceof Error && err.cause instanceof Error
    ? err.cause as Error & { code?: string }
    : undefined;

  console.error("Unhandled request error", {
    requestId: c.get("requestId") ?? "unknown",
    name: err.name,
    message: err.message,
    ...(causa ? {
      causeName: causa.name,
      causeMessage: causa.message,
      ...(causa.code ? { causeCode: causa.code } : {})
    } : {}),
    ...(err instanceof HttpError ? { code: err.code, status: err.status } : {}),
    ...(err instanceof ErrorAplicacion ? { code: err.code, status: err.status } : {}),
  });

  if (err instanceof HttpError) {
    return responderError(
      err.message,
      err.code,
      err.status as 400 | 401 | 403 | 404 | 422 | 500,
      err.details
    );
  }

  if (err instanceof ErrorAplicacion) {
    return responderError(
      err.message,
      err.code,
      err.status as 400 | 401 | 403 | 404 | 422 | 500,
      err.details
    );
  }

  return responderError("Error interno del servidor", "INTERNAL_SERVER_ERROR", 500);
};
