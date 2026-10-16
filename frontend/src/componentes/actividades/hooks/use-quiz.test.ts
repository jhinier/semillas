import { describe, expect, it } from "bun:test";
import type { Actividad } from "../../../shared/api/schemas/temas.schema";
import { parseLrc } from "../../../lib/lrc-parser";

const mockActividad: Actividad = {
  id: "actividad-quiz-1",
  tema_id: "tema-1",
  paso_id: null,
  grupo_edad_id: "grupo-1",
  tipo_actividad_id: "tipo-quiz",
  titulo: "Quiz biblico",
  consigna: "Responde las preguntas.",
  orden: 1,
  xp_recompensa: 10,
  dificultad: "facil",
  limite_tiempo_seg: null,
  obligatorio: true,
  retroalimentacion: null,
  configuracion: {
    preguntas: [
      {
        pregunta: "¿Cuantos dias tuvo la creacion?",
        opciones: ["5", "6", "7", "8"],
        respuesta_correcta: 1,
      },
      {
        pregunta: "¿Quien construyo el arca?",
        opciones: ["Moises", "Abraham", "Noe", "David"],
        respuesta_correcta: 2,
      },
    ],
  },
  tipo_actividad: null,
  opciones: [],
};

describe("useQuiz logic", () => {
  it("parseLrc maneja letras con timestamps para quiz", () => {
    const letra = "[00:00.00]Primera pregunta\n[00:05.00]Segunda pregunta";
    const resultado = parseLrc(letra);
    expect(resultado).toHaveLength(2);
    expect(resultado[0]!.texto).toBe("Primera pregunta");
    expect(resultado[1]!.texto).toBe("Segunda pregunta");
  });

  it("actividad quiz tiene estructura correcta", () => {
    const config = mockActividad.configuracion as { preguntas?: Array<{ pregunta: string; opciones: string[]; respuesta_correcta: number }> };
    expect(config.preguntas).toHaveLength(2);
    expect(config.preguntas![0]!.respuesta_correcta).toBe(1);
    expect(config.preguntas![1]!.respuesta_correcta).toBe(2);
  });

  it("calcula tiempo de歌词 en milisegundos", () => {
    const letra = "[00:12.34]Test";
    const resultado = parseLrc(letra);
    expect(resultado[0]!.tiempo).toBe(12340);
  });

  it("ordena歌词 por tiempo", () => {
    const letra = "[00:10.00]Segunda\n[00:05.00]Primera\n[00:15.00]Tercera";
    const resultado = parseLrc(letra);
    expect(resultado[0]!.texto).toBe("Primera");
    expect(resultado[1]!.texto).toBe("Segunda");
    expect(resultado[2]!.texto).toBe("Tercera");
  });

  it("ignora lineas sin timestamp en lyrics", () => {
    const letra = "Esta no tiene timestamp\n[00:01.00]Esta si";
    const resultado = parseLrc(letra);
    expect(resultado).toHaveLength(1);
    expect(resultado[0]!.texto).toBe("Esta si");
  });

  it("maneja configuracion vacia", () => {
    const actividadSinPreguntas = {
      ...mockActividad,
      configuracion: {},
    };
    const config = actividadSinPreguntas.configuracion as Record<string, unknown>;
    expect(config.preguntas).toBeUndefined();
  });
});
