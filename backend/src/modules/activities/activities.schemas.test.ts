import { describe, expect, it } from "bun:test";

import { responderActividadSchema } from "./activities.schemas";

const eventoId = "550e8400-e29b-41d4-a716-446655440000";
const opcionId = "550e8400-e29b-41d4-a716-446655440030";

describe("responderActividadSchema", () => {
  it("acepta una opción de respuesta", () => {
    expect(responderActividadSchema.safeParse({
      evento_id_cliente: eventoId,
      opcion_id_seleccionada: opcionId,
    }).success).toBe(true);
  });

  it("acepta la finalización guiada de una actividad", () => {
    expect(responderActividadSchema.safeParse({
      evento_id_cliente: eventoId,
      completada: true,
    }).success).toBe(true);
  });

  it("rechaza cargas ambiguas o vacías", () => {
    expect(responderActividadSchema.safeParse({ evento_id_cliente: eventoId }).success).toBe(false);
    expect(responderActividadSchema.safeParse({
      evento_id_cliente: eventoId,
      opcion_id_seleccionada: opcionId,
      completada: true,
    }).success).toBe(false);
  });
});
