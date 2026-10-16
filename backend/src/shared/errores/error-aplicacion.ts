export class ErrorAplicacion extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ErrorAplicacion";
  }
}

export class ErrorConflicto extends ErrorAplicacion {
  constructor(message: string, details?: unknown) {
    super(409, message, "CONFLICTO", details);
  }
}

export class ErrorNoEncontrado extends ErrorAplicacion {
  constructor(message: string, details?: unknown) {
    super(404, message, "NO_ENCONTRADO", details);
  }
}

export class ErrorNoAutorizado extends ErrorAplicacion {
  constructor(message: string, details?: unknown) {
    super(401, message, "NO_AUTORIZADO", details);
  }
}
