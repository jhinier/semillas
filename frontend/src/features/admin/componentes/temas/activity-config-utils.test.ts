import { describe, expect, it } from "bun:test";
import {
  crearIdFila,
  esRegistro,
  obtenerListaTexto,
  obtenerAfirmaciones,
  obtenerPares,
  obtenerTarjetas,
  obtenerOpcionesConCorrecta,
  obtenerEscenas,
  actualizarFilaTexto,
} from "./activity-config-utils";

describe("activity-config-utils", () => {
  describe("crearIdFila", () => {
    it("genera identificadores únicos con prefijo dado", () => {
      const id1 = crearIdFila("opcion");
      const id2 = crearIdFila("opcion");
      expect(id1).not.toBe(id2);
      expect(id1.startsWith("opcion-")).toBe(true);
      expect(id2.startsWith("opcion-")).toBe(true);
    });

    it("incrementa secuencialmente", () => {
      const id1 = crearIdFila("test");
      const id2 = crearIdFila("test");
      expect(id1).not.toBe(id2);
    });
  });

  describe("esRegistro", () => {
    it("devuelve true para objeto plano", () => {
      expect(esRegistro({})).toBe(true);
      expect(esRegistro({ clave: "valor" })).toBe(true);
    });

    it("devuelve false para null", () => {
      expect(esRegistro(null)).toBe(false);
    });

    it("devuelve false para arrays", () => {
      expect(esRegistro([])).toBe(false);
      expect(esRegistro([1, 2, 3])).toBe(false);
    });

    it("devuelve false para primitivos", () => {
      expect(esRegistro("texto")).toBe(false);
      expect(esRegistro(42)).toBe(false);
      expect(esRegistro(true)).toBe(false);
      expect(esRegistro(undefined)).toBe(false);
    });

    it("devuelve false para funciones", () => {
      expect(esRegistro(() => {})).toBe(false);
    });
  });

  describe("obtenerListaTexto", () => {
    it("devuelve array de strings cuando recibe array válido", () => {
      expect(obtenerListaTexto(["a", "b", "c"])).toEqual(["a", "b", "c"]);
    });

    it("filtra elementos que no son strings", () => {
      expect(obtenerListaTexto(["a", 1, "b", null, "c"])).toEqual(["a", "b", "c"]);
    });

    it("devuelve array vacío para valores no-array", () => {
      expect(obtenerListaTexto(null)).toEqual([]);
      expect(obtenerListaTexto(undefined)).toEqual([]);
      expect(obtenerListaTexto("texto")).toEqual([]);
      expect(obtenerListaTexto({})).toEqual([]);
    });
  });

  describe("obtenerAfirmaciones", () => {
    it("devuelve afirmaciones con id conservado", () => {
      const input = [{ id: "af-1", texto: "Dios es amor", es_verdadero: true }];
      expect(obtenerAfirmaciones(input)).toEqual([{ id: "af-1", texto: "Dios es amor", es_verdadero: true }]);
    });

    it("genera id cuando falta", () => {
      const input = [{ texto: "Jesús te ama", es_verdadero: false }];
      const result = obtenerAfirmaciones(input);
      expect(result[0]!.id).toMatch(/^afirmacion-\d+$/);
      expect(result[0]!.texto).toBe("Jesús te ama");
      expect(result[0]!.es_verdadero).toBe(false);
    });

    it("acepta propiedad correcta como alias de es_verdadero", () => {
      const input = [{ texto: "Fe", correcta: true }];
      const result = obtenerAfirmaciones(input);
      expect(result[0]!.es_verdadero).toBe(true);
    });

    it("devuelve array vacío para entrada no válida", () => {
      expect(obtenerAfirmaciones(null)).toEqual([]);
      expect(obtenerAfirmaciones("texto")).toEqual([]);
      expect(obtenerAfirmaciones([null])).toEqual([]);
    });
  });

  describe("obtenerPares", () => {
    it("devuelve pares con id conservado", () => {
      const input = [{ id: "par-1", izquierda: "Fe", derecha: "Confiar" }];
      expect(obtenerPares(input)).toEqual([{ id: "par-1", izquierda: "Fe", derecha: "Confiar" }]);
    });

    it("genera id cuando falta", () => {
      const input = [{ izquierda: "Amor", derecha: "Dios" }];
      const result = obtenerPares(input);
      expect(result[0]!.id).toMatch(/^par-\d+$/);
      expect(result[0]!.izquierda).toBe("Amor");
      expect(result[0]!.derecha).toBe("Dios");
    });

    it("devuelve array vacío para entrada no válida", () => {
      expect(obtenerPares(null)).toEqual([]);
      expect(obtenerPares([])).toEqual([]);
    });
  });

  describe("obtenerTarjetas", () => {
    it("devuelve tarjetas con texto", () => {
      const input = [{ id: "t-1", texto: "Oración" }];
      expect(obtenerTarjetas(input)).toEqual([{ id: "t-1", texto: "Oración" }]);
    });

    it("genera id secuencial cuando falta", () => {
      const input = [{ texto: "Alabanza" }];
      expect(obtenerTarjetas(input)[0]!.id).toBe("tarjeta-1");
    });

    it("devuelve array vacío para entrada no válida", () => {
      expect(obtenerTarjetas(null)).toEqual([]);
    });
  });

  describe("obtenerOpcionesConCorrecta", () => {
    it("conserva correcta true", () => {
      const input = [{ id: "op-1", texto: "A", correcta: true }];
      expect(obtenerOpcionesConCorrecta(input)[0]!.correcta).toBe(true);
    });

    it("acepta esCorrecta como alias", () => {
      const input = [{ id: "op-1", texto: "B", esCorrecta: true }];
      expect(obtenerOpcionesConCorrecta(input)[0]!.correcta).toBe(true);
    });

    it("marca primera opción como correcta si ninguna lo es", () => {
      const input = [
        { id: "op-1", texto: "A", correcta: false },
        { id: "op-2", texto: "B", correcta: false },
      ];
      const result = obtenerOpcionesConCorrecta(input);
      expect(result[0]!.correcta).toBe(true);
      expect(result[1]!.correcta).toBe(false);
    });

    it("devuelve array vacío para entrada no válida", () => {
      expect(obtenerOpcionesConCorrecta(null)).toEqual([]);
    });
  });

  describe("obtenerEscenas", () => {
    it("devuelve escenas con opciones incluidas", () => {
      const input = [{
        id: "escena-1",
        texto: "Eligió la virtud",
        imagen_url: "https://ejemplo.com/img.png",
        opciones: [{ id: "op-1", texto: "Virtud", correcta: true }],
      }];
      const result = obtenerEscenas(input);
      expect(result[0]!.texto).toBe("Eligió la virtud");
      expect(result[0]!.opciones[0]!.texto).toBe("Virtud");
    });

    it("provee opción por defecto cuando opciones está vacío", () => {
      const input = [{ id: "escena-1", texto: "Test", imagen_url: "", opciones: [] }];
      const result = obtenerEscenas(input);
      expect(result[0]!.opciones).toHaveLength(1);
      expect(result[0]!.opciones[0]!.correcta).toBe(true);
    });

    it("devuelve array vacío para entrada no válida", () => {
      expect(obtenerEscenas(null)).toEqual([]);
    });
  });

  describe("actualizarFilaTexto", () => {
    it("reemplaza el valor en el índice dado", () => {
      expect(actualizarFilaTexto(["a", "b", "c"], 1, "nuevo")).toEqual(["a", "nuevo", "c"]);
    });

    it("no modifica otros índices", () => {
      expect(actualizarFilaTexto(["a", "b", "c"], 0, "x")).toEqual(["x", "b", "c"]);
      expect(actualizarFilaTexto(["a", "b", "c"], 2, "z")).toEqual(["a", "b", "z"]);
    });

    it("crea nuevo array (inmutabilidad)", () => {
      const original = ["a", "b"];
      const result = actualizarFilaTexto(original, 0, "x");
      expect(original).toEqual(["a", "b"]);
      expect(result).not.toBe(original);
    });
  });
});
