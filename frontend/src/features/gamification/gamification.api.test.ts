import { describe, expect, it } from "bun:test";
import {
  CATALOGO_LOGROS_DEFAULT,
  REGLAS_NIVEL_DEFAULT,
  crearGamificacionOffline,
} from "./gamification.utils";

describe("API de gamificación", () => {
  it("mantiene un resumen offline seguro y completo", () => {
    expect(crearGamificacionOffline()).toEqual({
      nivel: {
        usuario_id: "local",
        xp_total: 0,
        numero_nivel: 1,
        nombre_nivel: "Brote",
      },
      logros: [],
      catalogo_logros: CATALOGO_LOGROS_DEFAULT,
      reglas_nivel: REGLAS_NIVEL_DEFAULT,
      racha: { actual: 0, mejor: 0 },
      pendientes_reclamar: 0,
    });
  });
});
