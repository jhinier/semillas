import { expect, test } from "bun:test";
import { MOMENTOS, evaluarMatrizCrecer, validarMatrizCrecer, type CeldaCrecer } from "./matriz-crecer";

const completa = (codigoMomento: (typeof MOMENTOS)[number]): CeldaCrecer => ({ grupoEdadId: "edad-1", codigoFranja: "semillas", codigoMomento, completa: true });

test("exige exactamente los seis momentos y no compensa duplicados", () => {
  const celdas = MOMENTOS.slice(0, 5).map(completa);
  celdas.push(completa("conectar"));
  const errores = validarMatrizCrecer(celdas, ["semillas"]);
  expect(errores.map((error) => error.codigo)).toEqual(expect.arrayContaining(["MOMENTO_DUPLICADO", "MOMENTO_AUSENTE"]));
});

test("acepta una franja completa", () => {
  expect(validarMatrizCrecer(MOMENTOS.map(completa), ["semillas"])).toEqual([]);
});

test("valida cada franja seleccionada por separado", () => {
  const errores = validarMatrizCrecer(MOMENTOS.map(completa), ["semillas", "exploradores"]);
  expect(errores.some((error) => error.grupoEdadId === "exploradores")).toBe(true);
});

test("evalúa las seis celdas exactas y su orden", () => {
  const celdas = MOMENTOS.map((codigoMomento, indice) => ({
    grupoEdadId: "edad-1",
    codigoMomento,
    completa: true,
    orden: indice + 1,
  }));
  expect(evaluarMatrizCrecer(["edad-1"], celdas).valida).toBe(true);
  expect(evaluarMatrizCrecer(["edad-1"], celdas.slice(0, 5)).celdas.at(-1)?.errores).toContain("momento_faltante");
});
