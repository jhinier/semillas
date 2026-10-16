import { describe, expect, it } from "bun:test";

import {
  calcularFondoPieza,
  crearPiezasRompecabezas,
  intercambiarPiezas,
  mezclarPiezasRompecabezas,
  normalizarDimensionesRompecabezas,
  rompecabezasCompletado,
} from "./rompecabezas.utils";

describe("rompecabezas utils", () => {
  it("crea piezas con posiciones correctas y actuales ordenadas", () => {
    const piezas = crearPiezasRompecabezas(2, 3);

    expect(piezas).toEqual([
      { id: 0, posicionCorrecta: 0, posicionActual: 0 },
      { id: 1, posicionCorrecta: 1, posicionActual: 1 },
      { id: 2, posicionCorrecta: 2, posicionActual: 2 },
      { id: 3, posicionCorrecta: 3, posicionActual: 3 },
      { id: 4, posicionCorrecta: 4, posicionActual: 4 },
      { id: 5, posicionCorrecta: 5, posicionActual: 5 },
    ]);
  });

  it("mezcla posiciones sin mutar las piezas originales", () => {
    const piezas = crearPiezasRompecabezas(2, 2);
    const randomValores = [0.9, 0.1, 0.8, 0.2];
    const mezcladas = mezclarPiezasRompecabezas(piezas, () => randomValores.shift() ?? 0.5);

    expect(piezas.map((pieza) => pieza.posicionActual)).toEqual([0, 1, 2, 3]);
    expect(mezcladas).not.toBe(piezas);
    expect(mezcladas.map((pieza) => pieza.posicionActual).sort()).toEqual([0, 1, 2, 3]);
    expect(rompecabezasCompletado(mezcladas)).toBe(false);
  });

  it("garantiza una mezcla no completada cuando hay mas de una pieza", () => {
    const piezas = crearPiezasRompecabezas(2, 2);
    const mezcladas = mezclarPiezasRompecabezas(piezas, () => 0.5);

    expect(rompecabezasCompletado(mezcladas)).toBe(false);
    expect(mezcladas.map((pieza) => pieza.posicionActual).sort()).toEqual([0, 1, 2, 3]);
  });

  it("normaliza dimensiones a enteros mayores o iguales a uno", () => {
    expect(normalizarDimensionesRompecabezas(2.8, 0)).toEqual({ filas: 2, columnas: 1 });
    expect(normalizarDimensionesRompecabezas(Number.NaN, Number.POSITIVE_INFINITY)).toEqual({ filas: 1, columnas: 1 });
    expect(normalizarDimensionesRompecabezas(undefined, undefined)).toEqual({ filas: 1, columnas: 1 });
  });

  it("intercambia dos piezas sin mutar el arreglo original", () => {
    const piezas = crearPiezasRompecabezas(2, 2);
    const intercambiadas = intercambiarPiezas(piezas, 0, 3);

    expect(piezas[0]?.posicionActual).toBe(0);
    expect(piezas[3]?.posicionActual).toBe(3);
    expect(intercambiadas.find((pieza) => pieza.id === 0)?.posicionActual).toBe(3);
    expect(intercambiadas.find((pieza) => pieza.id === 3)?.posicionActual).toBe(0);
  });

  it("detecta cuando el rompecabezas esta completado", () => {
    const piezas = crearPiezasRompecabezas(2, 2);

    expect(rompecabezasCompletado(piezas)).toBe(true);
    expect(rompecabezasCompletado(intercambiarPiezas(piezas, 0, 1))).toBe(false);
  });

  it("calcula fondo correcto para piezas de una grilla 3x3", () => {
    expect(calcularFondoPieza(4, 3, 3)).toEqual({
      fila: 1,
      columna: 1,
      backgroundSize: "300% 300%",
      backgroundPosition: "50% 50%",
    });
  });

  it("calcula fondo correcto para grillas de una sola fila o columna", () => {
    expect(calcularFondoPieza(1, 1, 3).backgroundPosition).toBe("50% 0%");
    expect(calcularFondoPieza(1, 3, 1).backgroundPosition).toBe("0% 50%");
  });
});
