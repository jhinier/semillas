import { describe, expect, it } from "bun:test";
import { normalizarProgresoResumen } from "./progress.api";

describe("normalizarProgresoResumen", () => {
  it("conserva el progreso descargado dentro del contrato de temas", () => {
    const progreso = normalizarProgresoResumen({
      progresos_tema: [
        {
          usuario_id: "usuario-1",
          tema_id: "tema-descargado",
          estado: "en_progreso",
          porcentaje: 40,
          iniciado_en: "2026-07-13T00:00:00.000Z",
          completado_en: null,
          ultimo_paso_id: "paso-2",
          actualizado_en: "2026-07-13T00:00:00.000Z",
        },
      ],
      progresos_actividad: [],
    });

    expect(progreso.progresos_tema[0]).toEqual({
      tema_id: "tema-descargado",
      estado: "en_progreso",
      porcentaje: 40,
      iniciado_en: "2026-07-13T00:00:00.000Z",
      completado_en: null,
      ultimo_paso_id: "paso-2",
    });
  });
});
