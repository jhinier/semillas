import { describe, expect, it } from "bun:test";

import type { ActivitiesRepository } from "../activities.repository";
import { crearCasoResponderActividad } from "./responder-actividad";

const usuario = {
  id: "usuario-1",
  role: "invitado",
  displayName: "Semillero",
  email: null,
  provider: "invitado",
} as const;

function crearRepositorio(tipoCodigo = "sopa_letras") {
  const llamadas: string[] = [];
  const repository = {
    obtenerActividadParaRespuesta: async () => ({
      id: "actividad-1",
      temaId: "tema-1",
      xpRecompensa: 20,
      tipoCodigo,
    }),
    obtenerOpcionDeActividad: async () => null,
    obtenerOpcionCorrecta: async () => null,
    registrarEventoProgreso: async (evento: { correcta: boolean; datos: Record<string, unknown> }) => {
      llamadas.push(`evento:${evento.correcta}:${String(evento.datos.completada)}`);
      return { id: "evento-1" };
    },
    upsertProgresoActividad: async () => { llamadas.push("progreso:actividad"); },
    upsertProgresoTema: async () => { llamadas.push("progreso:tema"); },
    evaluarLogrosUsuario: async () => [],
  } as unknown as ActivitiesRepository;

  return { repository, llamadas };
}

describe("responderActividad", () => {
  it("registra como correcta la finalización de una actividad guiada", async () => {
    const { repository, llamadas } = crearRepositorio();
    const responder = crearCasoResponderActividad({ actividades: repository });

    const result = await responder(usuario, "actividad-1", {
      evento_id_cliente: "550e8400-e29b-41d4-a716-446655440000",
      completada: true,
    });

    expect(result.correcta).toBe(true);
    expect(result.xp_otorgada).toBe(20);
    expect(llamadas).toEqual([
      "evento:true:true",
      "progreso:actividad",
      "progreso:tema",
    ]);
  });

  it("no permite completar un cuestionario sin responder una opción", async () => {
    const { repository } = crearRepositorio("cuestionario");
    const responder = crearCasoResponderActividad({ actividades: repository });

    await expect(responder(usuario, "actividad-1", {
      evento_id_cliente: "550e8400-e29b-41d4-a716-446655440000",
      completada: true,
    })).rejects.toThrow("Los cuestionarios deben enviarse con una opción de respuesta");
  });
});
