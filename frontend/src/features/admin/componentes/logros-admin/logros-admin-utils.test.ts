import { describe, expect, it } from "bun:test";
import {
  CRITERIOS_LOGRO,
  describirReglaLogro,
  formatearFechaCorta,
  formatearMetaCriterio,
  generarCodigoLogroDesdeNombre,
  obtenerCriterio,
  validarCodigoLogro,
} from "./logros-admin-utils";

describe("logros-admin-utils", () => {
  it("expone exactamente los tres criterios soportados", () => {
    expect(CRITERIOS_LOGRO).toHaveLength(3);
    expect(CRITERIOS_LOGRO.map((c) => c.codigo)).toEqual([
      "temas_completados",
      "actividades_completadas",
      "dias_racha",
    ]);
  });

  it("encuentra la descripción de un criterio válido", () => {
    expect(obtenerCriterio("dias_racha").etiqueta).toBe("Días de racha");
  });

  it("falla con un mensaje claro ante un criterio desconocido", () => {
    expect(() => obtenerCriterio("desconocido" as never)).toThrow(/no soportado/);
  });

  it("rechaza códigos vacíos y caracteres inválidos", () => {
    expect(validarCodigoLogro("")).toMatch(/al menos 3/);
    expect(validarCodigoLogro("AB")).toMatch(/al menos 3/);
    expect(validarCodigoLogro("con espacio")).toBeTruthy();
    expect(validarCodigoLogro("con@simbolo")).toBeTruthy();
  });

  it("normaliza mayúsculas al validar", () => {
    expect(validarCodigoLogro("PRIMER-TEMA")).toBeNull();
  });

  it("acepta códigos en minúsculas con números y separadores", () => {
    expect(validarCodigoLogro("primer-tema")).toBeNull();
    expect(validarCodigoLogro("racha_3_dias")).toBeNull();
    expect(validarCodigoLogro("nivel5")).toBeNull();
  });

  it("formatea fechas ISO a un formato legible en español", () => {
    expect(formatearFechaCorta("2026-07-13T15:00:00.000Z")).toMatch(/jul/);
    expect(formatearFechaCorta(null)).toBe("Sin fecha");
  });

  it("genera códigos válidos automáticamente desde nombres con acentos o signos", () => {
    expect(generarCodigoLogroDesdeNombre("El Amor de Dios")).toBe("el-amor-de-dios");
    expect(generarCodigoLogroDesdeNombre("¡Fe y Alegría! #1")).toBe("fe-y-alegria-1");
    expect(validarCodigoLogro(generarCodigoLogroDesdeNombre("Explorador Bíblico"))).toBeNull();
  });

  it("describe reglas y metas en español natural en singular y plural", () => {
    expect(formatearMetaCriterio("temas_completados", 1)).toBe("1 tema");
    expect(formatearMetaCriterio("temas_completados", 3)).toBe("3 temas");
    expect(formatearMetaCriterio("actividades_completadas", 1)).toBe("1 actividad");
    expect(formatearMetaCriterio("dias_racha", 1)).toBe("1 día");
    expect(describirReglaLogro("temas_completados", 1)).toBe("Al completar 1 tema bíblico");
    expect(describirReglaLogro("actividades_completadas", 5)).toBe("Al completar 5 actividades correctas");
    expect(describirReglaLogro("dias_racha", 7)).toBe("Al mantener 7 días seguidos de racha");
  });
});
