import { describe, expect, it } from "bun:test";

import { obtenerAfirmaciones, obtenerPares } from "./activity-config-utils";

describe("constructores de configuración de actividades", () => {
  it("conserva los identificadores de filas de verdadero o falso", () => {
    expect(
      obtenerAfirmaciones([{ id: "afirmacion-1", texto: "Dios es amor", es_verdadero: true }]),
    ).toEqual([{ id: "afirmacion-1", texto: "Dios es amor", es_verdadero: true }]);
  });

  it("conserva los identificadores de filas de pares", () => {
    expect(
      obtenerPares([{ id: "par-1", izquierda: "Fe", derecha: "Confiar en Dios" }]),
    ).toEqual([{ id: "par-1", izquierda: "Fe", derecha: "Confiar en Dios" }]);
  });
});
