import { describe, expect, it } from "bun:test";
import { openApiSpec } from "../backend/src/openapi/spec";
import { RUTAS_API } from "../frontend/src/shared/api/rutas-api";

const paths = openApiSpec.paths as Record<string, Record<string, unknown>>;

function normalizar(path: string) {
  return path.replace(/\{[^}]+\}/g, "{param}");
}

function existeOperacion(metodo: string, ruta: string) {
  return Object.entries(paths).some(([path, operaciones]) =>
    normalizar(path) === normalizar(ruta) && Boolean(operaciones[metodo]),
  );
}

describe("paridad frontend/OpenAPI", () => {
  it("documenta las rutas usadas por el cliente compartido", () => {
    const rutas: Array<[string, string]> = [
      ["get", RUTAS_API.CLUBES.LISTAR],
      ["get", RUTAS_API.CLUBES.MIOS],
      ["post", RUTAS_API.CLUBES.CREAR],
      ["post", RUTAS_API.CLUBES.UNIRSE],
      ["get", "/clubes/{param}"],
      ["post", "/clubes/{param}/retos/{param}/reclamar"],
      ["post", RUTAS_API.SYNC.PUSH],
      ["get", RUTAS_API.SYNC.PULL],
      ["post", RUTAS_API.PROGRESO.REGISTRAR],
      ["get", RUTAS_API.PROGRESO.MI],
      ["get", RUTAS_API.MEDIA.LISTAR],
      ["post", RUTAS_API.MEDIA.SUBIR],
    ];

    for (const [metodo, ruta] of rutas) {
      expect(existeOperacion(metodo, ruta), `${metodo.toUpperCase()} ${ruta}`).toBe(true);
    }
  });

  it("codifica IDs de rutas dinámicas y conserva la forma pública", () => {
    expect(RUTAS_API.CLUBES.DETALLE("club con espacio")).toBe("/clubes/club%20con%20espacio");
    expect(RUTAS_API.CLUBES.MIEMBRO("club/1", "miembro/1")).toBe("/clubes/club%2F1/miembros/miembro%2F1");
  });
});
