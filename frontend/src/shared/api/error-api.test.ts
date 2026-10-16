import { describe, expect, it } from "bun:test";
import { ErrorApi } from "@/shared/api/error-api";
import { obtenerMensajeErrorApi, peticion } from "@/shared/api/api";

describe("ErrorApi", () => {
  it("preserva el estado HTTP y el codigo del backend", () => {
    const error = new ErrorApi(
      "El correo an***@gmail.com ya pertenece a otra cuenta",
      409,
      "CONFLICTO",
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.estado).toBe(409);
    expect(error.status).toBe(409);
    expect(error.codigo).toBe("CONFLICTO");
    expect(error.message).toBe("El correo an***@gmail.com ya pertenece a otra cuenta");
    expect(error.name).toBe("ErrorApi");
  });
});

describe("peticion", () => {
  it("propaga el error de serializacion del cuerpo sin clasificarlo como error de red", async () => {
    const cuerpo: { referencia?: unknown } = {};
    cuerpo.referencia = cuerpo;

    const error = await peticion("/prueba", { cuerpo }).catch((error: unknown) => error);

    expect(error).toBeInstanceOf(TypeError);
    expect(error).not.toBeInstanceOf(ErrorApi);
  });

  it("normaliza un rechazo de red como ErrorApi", async () => {
    const fetchOriginal = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;

    try {
      const error = await peticion("/prueba").catch((error: unknown) => error);

      expect(error).toBeInstanceOf(ErrorApi);
      expect(error).toMatchObject({
        estado: 0,
        status: 0,
        codigo: "NETWORK_ERROR",
      });
    } finally {
      globalThis.fetch = fetchOriginal;
    }
  });

  it("conserva el estado y codigo de una respuesta HTTP no exitosa", async () => {
    const fetchOriginal = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ exito: false, error: "No autorizado", codigo: "UNAUTHORIZED" }), {
        status: 401,
      })) as unknown as typeof fetch;

    try {
      const error = await peticion("/prueba").catch((error: unknown) => error);

      expect(error).toMatchObject({
        estado: 401,
        status: 401,
        codigo: "UNAUTHORIZED",
      });
    } finally {
      globalThis.fetch = fetchOriginal;
    }
  });
});

describe("obtenerMensajeErrorApi", () => {
  it("extrae un mensaje legible cuando la API devuelve un error estructurado", () => {
    expect(obtenerMensajeErrorApi({ message: "El contenido debe tener al menos 5 caracteres" })).toBe(
      "El contenido debe tener al menos 5 caracteres",
    );
  });
});
