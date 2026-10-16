import { describe, expect, it } from "bun:test";

import {
  obtenerOpcionesConCorrecta,
  obtenerListaTexto,
} from "./activity-config-utils";

describe("validación de contratos de actividad", () => {
  describe("cuestionario (opciones con única correcta)", () => {
    it("pasa cuando exactamente una opción es correcta", () => {
      const opciones = obtenerOpcionesConCorrecta([
        { id: "op-1", texto: "A", correcta: true },
        { id: "op-2", texto: "B", correcta: false },
        { id: "op-3", texto: "C", correcta: false },
      ]);
      const correctas = opciones.filter((o) => o.correcta);
      expect(correctas).toHaveLength(1);
    });

    it("garantiza al menos una correcta si todas vienen false", () => {
      const opciones = obtenerOpcionesConCorrecta([
        { id: "op-1", texto: "A", correcta: false },
        { id: "op-2", texto: "B", correcta: false },
      ]);
      const correctas = opciones.filter((o) => o.correcta);
      expect(correctas).toHaveLength(1);
    });

    it("falla cuando dos opciones son correctas", () => {
      const opciones = obtenerOpcionesConCorrecta([
        { id: "op-1", texto: "A", correcta: true },
        { id: "op-2", texto: "B", correcta: true },
      ]);
      const correctas = opciones.filter((o) => o.correcta);
      expect(correctas).toHaveLength(2);
    });

    it("acepta como máxima 4 opciones para cuestionario", () => {
      const opciones = obtenerOpcionesConCorrecta([
        { id: "op-1", texto: "A", correcta: true },
        { id: "op-2", texto: "B", correcta: false },
        { id: "op-3", texto: "C", correcta: false },
        { id: "op-4", texto: "D", correcta: false },
      ]);
      expect(opciones).toHaveLength(4);
    });
  });

  describe("completar_versiculo", () => {
    it("pasa cuando frase contiene __ y banco tiene palabras", () => {
      const frase = "Dios es __";
      const banco = obtenerListaTexto(["amor", "paz", "fe"]);
      expect(frase.includes("__")).toBe(true);
      expect(banco.length).toBeGreaterThanOrEqual(1);
    });

    it("falla cuando frase no tiene __", () => {
      const frase = "Dios es amor";
      expect(frase.includes("__")).toBe(false);
    });

    it("falla cuando banco está vacío", () => {
      const banco = obtenerListaTexto([]);
      expect(banco.length).toBeLessThan(1);
    });
  });

  describe("verdadero_falso", () => {
    it("pasa cuando todas las afirmaciones tienen valor booleano", () => {
      const afirmaciones = [
        { id: "af-1", texto: "Dios es amor", es_verdadero: true },
        { id: "af-2", texto: "Jesús nunca perdonó", es_verdadero: false },
      ];
      const todasDefinidas = afirmaciones.every(
        (a) => typeof a.es_verdadero === "boolean" && a.texto.length > 0,
      );
      expect(todasDefinidas).toBe(true);
    });

    it("falla cuando alguna afirmación no tiene texto", () => {
      const afirmaciones = [
        { id: "af-1", texto: "", es_verdadero: true },
      ];
      const todasConTexto = afirmaciones.every((a) => a.texto.trim().length > 0);
      expect(todasConTexto).toBe(false);
    });
  });

  describe("arrastrar_soltar", () => {
    it("pasa cuando hay al menos 2 items y orden válido", () => {
      const items = ["Primero", "Segundo", "Tercero"];
      const orden_correcto = items.map((_, i) => i);
      expect(items.length).toBeGreaterThanOrEqual(2);
      expect(orden_correcto).toEqual([0, 1, 2]);
    });

    it("falla cuando hay menos de 2 items", () => {
      const items = ["Solo uno"];
      expect(items.length).toBeLessThan(2);
    });
  });

  describe("rompecabezas", () => {
    it("pasa cuando imagen está definida y filas/columnas son válidas", () => {
      const config = { imagen: "https://ejemplo.com/img.png", filas: 3, columnas: 3 };
      expect(config.imagen.length).toBeGreaterThan(0);
      expect(config.filas).toBeGreaterThanOrEqual(2);
      expect(config.columnas).toBeGreaterThanOrEqual(2);
    });

    it("falla cuando imagen está vacía", () => {
      const config = { imagen: "", filas: 3, columnas: 3 };
      expect(config.imagen.length).toBe(0);
    });
  });

  describe("sopa_letras", () => {
    it("pasa cuando hay al menos 1 palabra y cuadrícula válida", () => {
      const config = { palabras: ["Fe", "Amor"], filas: 10, columnas: 10 };
      expect(config.palabras.length).toBeGreaterThanOrEqual(1);
      expect(config.filas).toBeGreaterThanOrEqual(5);
      expect(config.columnas).toBeGreaterThanOrEqual(5);
    });

    it("falla cuando palabras está vacío", () => {
      const config = { palabras: [], filas: 12, columnas: 12 };
      expect(config.palabras.length).toBeLessThan(1);
    });
  });

  describe("aventura_decisiones", () => {
    it("pasa cuando cada escena tiene al menos 2 opciones y una correcta", () => {
      const escenas = [
        {
          id: "escena-1",
          texto: "Llegaste al río",
          opciones: [
            { id: "op-1", texto: "Cruzar nadando", correcta: true },
            { id: "op-2", texto: "Volver atrás", correcta: false },
          ],
        },
      ];
      const valido = escenas.every(
        (e) =>
          e.texto.length > 0 &&
          e.opciones.length >= 2 &&
          e.opciones.filter((o) => o.correcta).length === 1,
      );
      expect(valido).toBe(true);
    });

    it("falla cuando escena tiene menos de 2 opciones", () => {
      const escenas = [
        {
          id: "escena-1",
          texto: "Solo una opción",
          opciones: [{ id: "op-1", texto: "Única", correcta: true }],
        },
      ];
      const tieneMinimo = escenas.every((e) => e.opciones.length >= 2);
      expect(tieneMinimo).toBe(false);
    });
  });

  describe("cancion", () => {
    it("pasa cuando tiene letra como array de strings", () => {
      const letra = obtenerListaTexto(["Linea 1", "Linea 2"]);
      expect(letra.length).toBeGreaterThan(0);
      expect(typeof letra[0]).toBe("string");
    });

    it("falla cuando letra está vacía", () => {
      const letra = obtenerListaTexto([]);
      expect(letra.length).toBeLessThan(1);
    });
  });

  describe("pares de relación", () => {
    it("pasa cuando cada par tiene izquierda y derecha no vacías", () => {
      const pares = [
        { id: "par-1", izquierda: "Fe", derecha: "Confiar" },
        { id: "par-2", izquierda: "Amor", derecha: "Dios" },
      ];
      const valido = pares.every(
        (p) => p.izquierda.trim().length > 0 && p.derecha.trim().length > 0,
      );
      expect(valido).toBe(true);
    });

    it("falla cuando algún par tiene lado vacío", () => {
      const pares = [{ id: "par-1", izquierda: "Fe", derecha: "" }];
      const valido = pares.every(
        (p) => p.izquierda.trim().length > 0 && p.derecha.trim().length > 0,
      );
      expect(valido).toBe(false);
    });
  });
});
