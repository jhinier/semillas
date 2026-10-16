import { expect, test } from "bun:test";
import { validarTrazabilidad } from "../scripts/validar-trazabilidad";

test("rechaza requisito cumple sin prueba ni evidencia", () => {
  const errores = validarTrazabilidad([{ id: "RF-01", estado: "cumple", gate: "G2", pruebas: [], evidencias: [] }]);
  expect(errores.map((error) => error.codigo)).toContain("EVIDENCIA_REQUERIDA");
});

test("rechaza IDs duplicados y gates ausentes", () => {
  const errores = validarTrazabilidad([
    { id: "RF-01", estado: "brecha", gate: "G2" },
    { id: "RF-01", estado: "brecha", gate: "" },
  ]);
  expect(errores.map((error) => error.codigo)).toEqual(expect.arrayContaining(["ID_DUPLICADO", "GATE_REQUERIDO"]));
});

test("acepta una brecha sin evidencia de cierre", () => {
  expect(validarTrazabilidad([{ id: "RF-01", estado: "brecha", gate: "G2" }])).toEqual([]);
});

test("rechaza una matriz que omite un ID obligatorio", () => {
  const errores = validarTrazabilidad([], true);
  expect(errores.some((error) => error.codigo === "ID_AUSENTE" && error.id === "RF-B1")).toBe(true);
});
