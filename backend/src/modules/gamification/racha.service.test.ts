import { expect, test } from "bun:test";
import { calcularRachaDiaria } from "./racha.service";

const referencia = new Date("2026-07-13T12:00:00.000Z");

test("cuenta hoy y días consecutivos anteriores", () => {
  expect(calcularRachaDiaria(["2026-07-11", "2026-07-12", "2026-07-13"], referencia)).toEqual({ actual: 3, mejor: 3 });
});

test("un hueco reinicia la racha actual pero conserva la mejor", () => {
  expect(calcularRachaDiaria(["2026-07-08", "2026-07-10", "2026-07-11", "2026-07-13"], referencia)).toEqual({ actual: 1, mejor: 2 });
});

test("una fecha futura del cliente no altera la racha actual", () => {
  expect(calcularRachaDiaria(["2026-07-14"], referencia).actual).toBe(0);
});

test("usa la zona horaria de referencia al cambiar de día", () => {
  const antesDeLaMedianocheLocal = new Date("2026-07-13T04:30:00.000Z");
  expect(calcularRachaDiaria(["2026-07-12"], antesDeLaMedianocheLocal).actual).toBe(1);
});

test("permite verificar otra zona horaria sin alterar los datos del servidor", () => {
  const fecha = new Date("2026-07-13T00:30:00.000Z");
  expect(calcularRachaDiaria(["2026-07-13"], fecha, "UTC").actual).toBe(1);
  expect(calcularRachaDiaria(["2026-07-12"], fecha, "America/Guayaquil").actual).toBe(1);
});
