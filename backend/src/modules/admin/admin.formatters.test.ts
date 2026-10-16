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
});
