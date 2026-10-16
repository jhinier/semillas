import { describe, expect, it } from "bun:test";
import { ActividadConfigSchema, CODIGOS_ACTIVIDAD_CANONICOS } from "./actividad-config.schema";

const ejemplos: Record<(typeof CODIGOS_ACTIVIDAD_CANONICOS)[number], unknown> = {
  cuestionario: { tipo: "cuestionario", opciones: [{ texto: "Sí", correcta: true }, { texto: "No" }] },
  tarjetas_memoria: { tipo: "tarjetas_memoria", pares: [{ id: "a", texto: "A" }, { id: "b", texto: "B" }] },
  completar_versiculo: { tipo: "completar_versiculo", frase: "Dios __ amor", respuesta: "es", opciones: ["es"] },
  relacionar_pares: { tipo: "relacionar_pares", pares: [{ izquierda: "A", derecha: "B" }, { izquierda: "C", derecha: "D" }] },
  verdadero_falso: { tipo: "verdadero_falso", afirmaciones: [{ texto: "A", es_verdadero: true }, { texto: "B", es_verdadero: false }] },
  sopa_letras: { tipo: "sopa_letras", palabras: ["fe", "paz"], filas: 6, columnas: 6 },
  arrastrar_soltar: { tipo: "arrastrar_soltar", items: ["A", "B"], orden_correcto: [0, 1] },
  rompecabezas: { tipo: "rompecabezas", imagen: "https://example.com/a.png", filas: 2, columnas: 2 },
  aventura_decisiones: { tipo: "aventura_decisiones", escenas: [{ texto: "Elige", opciones: [{ texto: "A" }, { texto: "B", correcta: true }] }] },
  actividad_audio: { tipo: "actividad_audio", audio_url: "https://example.com/a.mp3", pregunta: "¿Qué oíste?", opciones: [{ texto: "A" }, { texto: "B" }] },
  actividad_video: { tipo: "actividad_video", video_url: "https://example.com/a.mp4", pregunta: "¿Qué viste?", opciones: [{ texto: "A" }, { texto: "B" }], respuesta_correcta: 0 },
  manualidad: { tipo: "manualidad", materiales: ["Papel"], pasos: ["Dobla"] },
  cancion: { tipo: "cancion", audio_url: "https://example.com/a.mp3", letra: ["Canta"] },
};

describe("ActividadConfigSchema", () => {
  it("acepta un ejemplo válido por cada código canónico", () => {
    for (const codigo of CODIGOS_ACTIVIDAD_CANONICOS) {
      expect(ActividadConfigSchema.safeParse(ejemplos[codigo]).success).toBe(true);
    }
  });

  it("rechaza configuraciones incompletas y aliases antiguos", () => {
    expect(ActividadConfigSchema.safeParse({ tipo: "quiz", opciones: [] }).success).toBe(false);
    expect(ActividadConfigSchema.safeParse({ tipo: "sopa_letras", palabras: ["fe"], filas: 2, columnas: 2 }).success).toBe(false);
  });
});
