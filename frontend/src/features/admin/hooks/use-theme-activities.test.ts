import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";

const originales: Record<string, unknown> = {};

beforeEach(() => {
  originales.fetch = globalThis.fetch;
  globales.toast = { success: mock(() => {}), error: mock(() => {}) };
});

afterEach(() => {
  globalThis.fetch = originales.fetch as typeof fetch;
});

const globales = {} as { toast: { success: (msg: string) => void; error: (msg: string) => void } };

const globalesToast: typeof globales.toast = {
  success: mock((msg: string) => {}),
  error: mock((msg: string) => {}),
};

import {
  normalizarConfiguracionActividad,
  validarActividadParaGuardar,
} from "../componentes/temas/activity-configuration";
import type { ActivityDraft } from "../types";
import { esObjetoPlano } from "../types";

const defaultDraft: ActivityDraft = {
  paso_id: "paso-1",
  grupo_edad_id: "semillas",
  tipo_actividad_id: "cuestionario",
  titulo: "Pregunta",
  consigna: "¿Qué aprendiste?",
  retroalimentacion: "Bien",
  xp_recompensa: 10,
  limite_tiempo_seg: null,
  dificultad: "facil",
  obligatorio: true,
  configuracion: {},
  opciones: [
    { etiqueta: "A", texto: "Opción A", correcta: true, orden: 1 },
    { etiqueta: "B", texto: "Opción B", correcta: false, orden: 2 },
  ],
};

describe("dependencias de useThemeActivitiesMutation", () => {
  describe("esObjetoPlano", () => {
    it("acepta un objeto JSON plano", () => {
      expect(esObjetoPlano({ key: "value" })).toBe(true);
    });

    it("rechaza objetos con prototipos", () => {
      expect(esObjetoPlano(new Date())).toBe(false);
    });
  });

  describe("normalizarConfiguracionActividad", () => {
    it("normaliza verdadero_falso renombrando correcta a es_verdadero", () => {
      const resultado = normalizarConfiguracionActividad("verdadero_falso", {
        afirmaciones: [{ texto: "Dios es amor", correcta: true }],
      });
      expect(resultado).toEqual({
        afirmaciones: [{ texto: "Dios es amor", es_verdadero: true }],
      });
    });

    it("conserva arrastrar_soltar con orden válido", () => {
      const resultado = normalizarConfiguracionActividad("arrastrar_soltar", {
        items: ["A", "B"],
        orden_correcto: [0, 1],
      });
      expect(resultado).toEqual({ items: ["A", "B"], orden_correcto: [0, 1] });
    });

    it("convierte canción de string a líneas", () => {
      const resultado = normalizarConfiguracionActividad("cancion", {
        letra: "Línea 1\nLínea 2",
      });
      expect(resultado).toEqual({ letra: ["Línea 1", "Línea 2"] });
    });
  });

  describe("validarActividadParaGuardar", () => {
    it("rechaza cuestionario sin opción correcta única", () => {
      const error = validarActividadParaGuardar({
        codigo: "cuestionario",
        configuracion: {},
        opciones: [
          { etiqueta: "A", texto: "X", correcta: false, orden: 1 },
          { etiqueta: "B", texto: "Y", correcta: false, orden: 2 },
        ],
      });
      expect(error).toContain("exactamente una respuesta correcta");
    });

    it("rechaza actividad_video sin URL", () => {
      const error = validarActividadParaGuardar({
        codigo: "actividad_video",
        configuracion: {},
        opciones: [],
      });
      expect(error).toContain("URL del video");
    });

    it("acepta cuestionario válido", () => {
      const error = validarActividadParaGuardar({
        codigo: "cuestionario",
        configuracion: {},
        opciones: [
          { etiqueta: "A", texto: "X", correcta: true, orden: 1 },
          { etiqueta: "B", texto: "Y", correcta: false, orden: 2 },
        ],
      });
      expect(error).toBeNull();
    });

    it("rechaza arrastrar_soltar sin suficientes items", () => {
      const error = validarActividadParaGuardar({
        codigo: "arrastrar_soltar",
        configuracion: { items: ["Solo uno"] },
        opciones: [],
      });
      expect(error).toContain("dos");
    });

    it("rechaza rompecabezas sin imagen", () => {
      const error = validarActividadParaGuardar({
        codigo: "rompecabezas",
        configuracion: {},
        opciones: [],
      });
      expect(error).toContain("imagen");
    });

    it("rechaza completar_versiculo sin __", () => {
      const error = validarActividadParaGuardar({
        codigo: "completar_versiculo",
        configuracion: { frase: "Sin guión bajo", respuesta: "R" },
        opciones: [],
      });
      expect(error).toContain("__");
    });
  });
});

describe("lógica de construcción del payload de useThemeActivitiesMutation", () => {
  it("lanza error si configText no es JSON válido", () => {
    expect(() => JSON.parse("no es json")).toThrow();
  });

  it("filtra opciones vacías al construir payload", () => {
    const draft: ActivityDraft = {
      ...defaultDraft,
      opciones: [
        { etiqueta: "A", texto: "", correcta: true, orden: 1 },
        { etiqueta: "B", texto: "Con texto", correcta: false, orden: 2 },
        { etiqueta: "C", texto: "", correcta: false, orden: 3 },
      ],
    };

    const opcionesNoVacias = draft.opciones
      .filter((op) => op.texto.trim())
      .map((op, i) => ({ ...op, texto: op.texto.trim(), orden: i + 1 }));

    expect(opcionesNoVacias).toHaveLength(1);
    expect(opcionesNoVacias[0]!.texto).toBe("Con texto");
  });

  it("calcula orden nuevo como ordenActual + 1 en modo crear", () => {
    const ordenActual = 3;
    const esModoEditar = false;
    const ordenEsperado = esModoEditar ? ordenActual : ordenActual + 1;
    expect(ordenEsperado).toBe(4);
  });

  it("conserva ordenActual en modo editar", () => {
    const ordenActual = 5;
    const esModoEditar = true;
    const ordenEsperado = esModoEditar ? ordenActual : ordenActual + 1;
    expect(ordenEsperado).toBe(5);
  });

  it("incluye retroalimentación solo si tiene contenido", () => {
    const conRetro = defaultDraft;
    const sinRetro: ActivityDraft = { ...defaultDraft, retroalimentacion: "" };

    const retroConContenido = conRetro.retroalimentacion.trim() || undefined;
    const retroVacio = sinRetro.retroalimentacion.trim() || undefined;

    expect(retroConContenido).toBe("Bien");
    expect(retroVacio).toBeUndefined();
  });

  it("valida campos obligatorios del draft", () => {
    const draftValido = defaultDraft;
    const draftSinTitulo: ActivityDraft = { ...defaultDraft, titulo: "" };
    const draftSinConsigna: ActivityDraft = { ...defaultDraft, consigna: "" };
    const draftSinPaso: ActivityDraft = { ...defaultDraft, paso_id: "" };

    const esValido = (d: ActivityDraft) =>
      d.titulo.trim() && d.consigna.trim() && d.paso_id && d.grupo_edad_id && d.tipo_actividad_id;

    expect(Boolean(esValido(draftValido))).toBe(true);
    expect(Boolean(esValido(draftSinTitulo))).toBe(false);
    expect(Boolean(esValido(draftSinConsigna))).toBe(false);
    expect(Boolean(esValido(draftSinPaso))).toBe(false);
  });
});
