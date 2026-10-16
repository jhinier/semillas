export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = "HTTP_ERROR",
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Solicitud inválida", details?: unknown) {
    super(400, message, "BAD_REQUEST", details);
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message = "La entidad no cumple las reglas de negocio", details?: unknown) {
    super(422, message, "UNPROCESSABLE_ENTITY", details);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "No autenticado") {
    super(401, message, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "No autorizado") {
    super(403, message, "FORBIDDEN");
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "No encontrado") {
    super(404, message, "NOT_FOUND");
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Conflicto", details?: unknown) {
    super(409, message, "CONFLICT", details);
  }
}
