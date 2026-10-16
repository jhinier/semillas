import { describe, expect, it } from "bun:test";

import { defaultOptions, emptyDraft } from "../../types";
import { crearActividadDesdeBorrador } from "./activity-draft-preview";

describe("crearActividadDesdeBorrador", () => {
  it("crea una actividad compatible con el renderizador del estudiante", () => {
    const activity = crearActividadDesdeBorrador(
      {
        ...emptyDraft,
        paso_id: "paso-1",
        grupo_edad_id: "grupo-1",
        tipo_actividad_id: "tipo-1",
        titulo: "  El buen samaritano  ",
        consigna: "  Selecciona una respuesta.  ",
        opciones: defaultOptions.map((option, index) => ({
          ...option,
          texto: index < 2 ? `Respuesta ${index + 1}` : "",
        })),
      },
      "cuestionario",
      "Quiz",
    );

    expect(activity.titulo).toBe("El buen samaritano");
    expect(activity.consigna).toBe("Selecciona una respuesta.");
    expect(activity.tipo_actividad?.codigo).toBe("cuestionario");
    expect(activity.opciones).toHaveLength(2);
    expect(activity.opciones[0]?.id).toMatch(/^00000000-/);
  });
});
