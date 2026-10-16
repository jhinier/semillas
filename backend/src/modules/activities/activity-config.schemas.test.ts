import { describe, expect, it } from "bun:test";
import { actividadConfigSchema } from "./activity-config.schemas";

const ejemplos = [
  { tipo: "cuestionario", opciones: [{ texto: "Sí" }, { texto: "No" }] },
  { tipo: "tarjetas_memoria", pares: [{ id: "a", texto: "A" }, { id: "b", texto: "B" }] },
  { tipo: "completar_versiculo", frase: "Dios __ amor", respuesta: "es", opciones: ["es"] },
  { tipo: "relacionar_pares", pares: [{ izquierda: "A", derecha: "B" }, { izquierda: "C", derecha: "D" }] },
  { tipo: "verdadero_falso", afirmaciones: [{ texto: "A", es_verdadero: true }, { texto: "B", es_verdadero: false }] },
  { tipo: "sopa_letras", palabras: ["fe", "paz"], filas: 6, columnas: 6 },
  { tipo: "arrastrar_soltar", items: ["A", "B"], orden_correcto: [0, 1] },
  { tipo: "rompecabezas", imagen: "imagen-1", filas: 2, columnas: 2 },
  { tipo: "aventura_decisiones", escenas: [{ texto: "Elige", opciones: [{ texto: "A" }, { texto: "B" }] }] },
  { tipo: "actividad_audio", audio_url: "https://example.com/a.mp3", pregunta: "¿Qué?", opciones: [{ texto: "A" }, { texto: "B" }] },
  { tipo: "actividad_video", video_url: "https://example.com/a.mp4", pregunta: "¿Qué?", opciones: [{ texto: "A" }, { texto: "B" }], respuesta_correcta: 0 },
  { tipo: "manualidad", materiales: ["Papel"], pasos: ["Dobla"] },
  { tipo: "cancion", audio_url: "https://example.com/a.mp3", letra: ["Canta"] },
];

describe("contrato canónico de configuración de actividades", () => {
  it("acepta los 13 tipos", () => {
    expect(ejemplos.every((ejemplo) => actividadConfigSchema.safeParse(ejemplo).success)).toBe(true);
  });

  it("rechaza aliases y payloads incompletos", () => {
    expect(actividadConfigSchema.safeParse({ tipo: "quiz", opciones: [] }).success).toBe(false);
    expect(actividadConfigSchema.safeParse({ tipo: "rompecabezas", imagen: "x", filas: 1, columnas: 1 }).success).toBe(false);
  });
});
