import { describe, expect, it } from "bun:test";
import { crearGamificacionOffline } from "./gamification.utils";

describe("API de gamificación", () => {
  it("mantiene un resumen offline seguro y completo", () => {
    expect(crearGamificacionOffline()).toEqual({
      nivel: null,
      logros: [],
      catalogo_logros: [],
      reglas_nivel: [],
      racha: { actual: 0, mejor: 0 },
      pendientes_reclamar: 0,
    });
  });
});
