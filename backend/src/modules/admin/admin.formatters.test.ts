import { describe, expect, it } from "bun:test";

import { mapActivity } from "./admin.formatters";

function activityWithThemeStatus(status: string) {
  return mapActivity({
    id: "actividad-1",
    tema_id: "tema-1",
    grupo_edad_id: "grupo-1",
    tipo_actividad_id: "tipo-1",
    titulo: "Actividad",
    consigna: "Consigna",
    obligatorio: false,
    tema: {
      id: "tema-1",
      titulo: "Tema",
      slug: "tema",
      estado: status,
    },
  });
}

describe("mapActivity", () => {
  it("deriva el estado editorial desde el tema y no desde obligatorio", () => {
    expect(activityWithThemeStatus("publicado").estado).toBe("publicada");
    expect(activityWithThemeStatus("revision").estado).toBe("revision");
    expect(activityWithThemeStatus("borrador").estado).toBe("borrador");
  });

  it("parsea configuracion serializada como JSON y ordena opciones por orden ascendente", () => {
    const mapeada = mapActivity({
      id: "act-1",
      tema_id: "tema-1",
      grupo_edad_id: "grupo-1",
      tipo_actividad_id: "tipo-quiz",
      titulo: "Quiz",
      consigna: "Responde",
      obligatorio: true,
      configuracion: '{"preguntas":[{"pregunta":"¿Quién nos ama?","opciones":["Dios","Otro"],"respuesta_correcta":0}]}',
      opciones: [
        { id: "op-2", etiqueta: "B", texto: "Segunda", correcta: false, orden: 2 },
        { id: "op-1", etiqueta: "A", texto: "Primera", correcta: true, orden: 1 },
      ],
    });

    expect(mapeada.configuracion).toEqual({
      preguntas: [{ pregunta: "¿Quién nos ama?", opciones: ["Dios", "Otro"], respuesta_correcta: 0 }],
    });
    expect(mapeada.opciones.map((o) => o.texto)).toEqual(["Primera", "Segunda"]);
  });
});
