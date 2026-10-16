import { expect, test } from "bun:test";
import { calcularEsperaReintento } from "./sync-lifecycle";

test("usa backoff exponencial acotado y jitter controlado", () => {
  expect(calcularEsperaReintento(0, 0)).toBe(1_000);
  expect(calcularEsperaReintento(1, 0)).toBe(2_000);
  expect(calcularEsperaReintento(2, 1)).toBe(5_000);
  expect(calcularEsperaReintento(99, 1)).toBe(30_000);
});
