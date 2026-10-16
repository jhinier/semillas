import { describe, expect, it } from "bun:test";

import {
  afirmacionesAlineas,
  normalizarConfiguracionActividad,
  validarActividadParaGuardar,
} from "./activity-configuration";

describe("normalizarConfiguracionActividad", () => {
  it("usa es_verdadero para las afirmaciones de verdadero o falso", () => {
    expect(
      normalizarConfiguracionActividad("verdadero_falso", {
        afirmaciones: [{ texto: "Dios es amor", correcta: true }],
      }),
    ).toEqual({
      afirmaciones: [{ texto: "Dios es amor", es_verdadero: true }],
    });
  });

  it("conserva el valor correcto al volver a editar una afirmación normalizada", () => {
    expect(
      afirmacionesAlineas([{ texto: "Dios es amor", es_verdadero: true }]),
    ).toBe("Dios es amor|true");
  });

  it("guarda el orden de arrastrar y soltar como índices", () => {
    expect(
      normalizarConfiguracionActividad("arrastrar_soltar", {
        items: ["Orar", "Escuchar", "Compartir"],
      }),
    ).toEqual({
      items: ["Orar", "Escuchar", "Compartir"],
      orden_correcto: [0, 1, 2],
    });
  });

  it("convierte la letra de una canción en líneas", () => {
    expect(
      normalizarConfiguracionActividad("cancion", {
        letra: "Dios es bueno\nSiempre fiel",
      }),
    ).toEqual({
      letra: ["Dios es bueno", "Siempre fiel"],
    });
  });

  it("elimina líneas vacías de la letra de una canción", () => {
    expect(
      normalizarConfiguracionActividad("cancion", {
        letra: "Dios es bueno\n\n  \nSiempre fiel\n",
      }),
    ).toEqual({
      letra: ["Dios es bueno", "Siempre fiel"],
    });
  });

  it("reemplaza una secuencia inválida por el orden de los elementos", () => {
    expect(
      normalizarConfiguracionActividad("arrastrar_soltar", {
        items: ["Orar", "Escuchar"],
        orden_correcto: [0, 0],
      }),
    ).toEqual({
      items: ["Orar", "Escuchar"],
      orden_correcto: [0, 1],
    });
  });

  it("reemplaza índices fuera de rango por el orden natural", () => {
    expect(
      normalizarConfiguracionActividad("arrastrar_soltar", {
        items: ["Orar", "Escuchar"],
        orden_correcto: [0, 2],
      }),
    ).toEqual({
      items: ["Orar", "Escuchar"],
      orden_correcto: [0, 1],
    });
  });
});

describe("validarActividadParaGuardar", () => {
  it("rechaza un cuestionario sin una única respuesta correcta", () => {
    const resultado = validarActividadParaGuardar({
      codigo: "cuestionario",
      configuracion: {},
      opciones: [
        { etiqueta: "A", texto: "Primera", correcta: false, orden: 1 },
        { etiqueta: "B", texto: "Segunda", correcta: false, orden: 2 },
      ],
    });

    expect(resultado).toContain("exactamente una respuesta correcta");
  });

  it("rechaza una actividad de video sin URL", () => {
    const resultado = validarActividadParaGuardar({
      codigo: "actividad_video",
      configuracion: {},
      opciones: [],
    });

    expect(resultado).toContain("URL del video");
  });

  it("valida el alias video con el mismo contrato de URL", () => {
    const resultado = validarActividadParaGuardar({
      codigo: "video",
      configuracion: {},
      opciones: [],
    });

    expect(resultado).toContain("URL del video");
  });

  it("rechaza una actividad de audio sin pregunta y opciones suficientes", () => {
    const resultado = validarActividadParaGuardar({
      codigo: "actividad_audio",
      configuracion: { audio_url: "https://cdn.ejemplo.com/audio.mp3" },
      opciones: [],
    });

    expect(resultado).toContain("pregunta");
  });

  it("rechaza completar versículo sin banco de palabras", () => {
    const resultado = validarActividadParaGuardar({
      codigo: "completar_versiculo",
      configuracion: { frase: "Ama a tu ____", respuesta: "prójimo" },
      opciones: [],
    });

    expect(resultado).toContain("palabras");
  });

  it("rechaza una aventura sin opciones jugables", () => {
    const resultado = validarActividadParaGuardar({
      codigo: "aventura_decisiones",
      configuracion: {
        escenas: [{ texto: "Llegas a una bifurcación" }],
      },
      opciones: [],
    });

    expect(resultado).toContain("opciones");
  });

  it("rechaza afirmaciones de verdadero o falso incompletas", () => {
    const resultado = validarActividadParaGuardar({
      codigo: "verdadero_falso",
      configuracion: { afirmaciones: [{ texto: "Dios es amor" }] },
      opciones: [],
    });

    expect(resultado).toContain("afirmaciones");
  });

  it("rechaza una secuencia con índices duplicados", () => {
    const resultado = validarActividadParaGuardar({
      codigo: "arrastrar_soltar",
      configuracion: {
        items: ["Orar", "Escuchar"],
        orden_correcto: [0, 0],
      },
      opciones: [],
    });

    expect(resultado).toContain("orden válido");
  });

  it("rechaza una canción con letra o acciones no textuales", () => {
    const letraInvalida = validarActividadParaGuardar({
      codigo: "cancion",
      configuracion: { letra: ["Dios es bueno", 3] },
      opciones: [],
    });
    const accionesInvalidas = validarActividadParaGuardar({
      codigo: "cancion",
      configuracion: { letra: ["Dios es bueno"], acciones: false },
      opciones: [],
    });

    expect(letraInvalida).toContain("letra");
    expect(accionesInvalidas).toContain("acciones");
  });
});
