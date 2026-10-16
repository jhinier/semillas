import { describe, expect, it } from "bun:test";
import {
  ErrorAplicacion,
  ErrorConflicto,
  ErrorNoAutorizado,
  ErrorNoEncontrado
} from "./error-aplicacion";

describe("errores de aplicacion", () => {
  it("conserva codigo, estado y detalle", () => {
    const error = new ErrorAplicacion(422, "No válido", "INVALIDO", {
      campo: "titulo"
    });

    expect(error.status).toBe(422);
    expect(error.message).toBe("No válido");
    expect(error.code).toBe("INVALIDO");
    expect(error.details).toEqual({ campo: "titulo" });
  });

  it("crea errores tipados para conflicto, no encontrado y no autorizado", () => {
    expect(new ErrorConflicto("Duplicado").status).toBe(409);
    expect(new ErrorNoEncontrado("Falta").status).toBe(404);
    expect(new ErrorNoAutorizado("Sin acceso").status).toBe(401);
  });
});
