import { describe, expect, it } from "bun:test";

import {
  agregarRelacionCompletada,
  mezclarRelacionesConceptos,
  relacionesCompletadas,
  validarIntentoRelacion,
  type ParConcepto,
} from "./relacionar-conceptos.utils";

const pares: ParConcepto[] = [
  { id: "noe", concepto: "Noe", relacion: "Construyo el arca" },
  { id: "david", concepto: "David", relacion: "Vencio a Goliat" },
  { id: "moises", concepto: "Moises", relacion: "Cruzo el Mar Rojo" },
];

describe("relacionar conceptos utils", () => {
  it("mezcla relaciones sin mutar los pares originales", () => {
    const randomValores = [0.9, 0.1, 0.5];
    const relaciones = mezclarRelacionesConceptos(pares, () => randomValores.shift() ?? 0.5);

    expect(pares[0]?.relacion).toBe("Construyo el arca");
    expect(relaciones).toHaveLength(3);
    expect(relaciones.map((relacion) => relacion.id)).toEqual(["david", "moises", "noe"]);
  });

  it("valida intento correcto e incorrecto", () => {
    expect(validarIntentoRelacion("noe", "noe")).toEqual({ correcto: true, conceptoId: "noe", relacionId: "noe" });
    expect(validarIntentoRelacion("noe", "david")).toEqual({ correcto: false, conceptoId: "noe", relacionId: "david" });
  });

  it("agrega completadas sin duplicar ni mutar", () => {
    const completadas = ["noe"];

    expect(agregarRelacionCompletada(completadas, "david")).toEqual(["noe", "david"]);
    expect(agregarRelacionCompletada(completadas, "noe")).toEqual(["noe"]);
    expect(completadas).toEqual(["noe"]);
  });

  it("detecta actividad completada", () => {
    expect(relacionesCompletadas(pares, ["noe", "david"])).toBe(false);
    expect(relacionesCompletadas(pares, ["noe", "david", "moises"])).toBe(true);
  });
});
