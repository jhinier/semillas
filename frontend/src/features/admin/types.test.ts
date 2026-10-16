import { describe, expect, it } from "bun:test";

import {
  defaultOptions,
  emptyDraft,
  actualizarGrupoEdadDelBorrador,
  esObjetoPlano,
  tieneContenidoEnBorrador,
  type ActivityDraft,
  type OptionDraft,
} from "./types";

describe("OptionDraft", () => {
  it("tiene la forma correcta", () => {
    const opcion: OptionDraft = {
      etiqueta: "A",
      texto: "Opción A",
      correcta: true,
      orden: 1,
    };

    expect(opcion.etiqueta).toBe("A");
    expect(opcion.texto).toBe("Opción A");
    expect(opcion.correcta).toBe(true);
    expect(opcion.orden).toBe(1);
  });
});

describe("ActivityDraft", () => {
  it("tiene la forma correcta con todos los campos", () => {
    const draft: ActivityDraft = {
      paso_id: "paso-1",
      grupo_edad_id: "semillas",
      tipo_actividad_id: "cuestionario",
      titulo: "Pregunta bíblica",
      consigna: "¿Qué aprendiste?",
      retroalimentacion: "Muy bien",
      xp_recompensa: 15,
      limite_tiempo_seg: 60,
      dificultad: "normal",
      obligatorio: true,
      configuracion: {},
      opciones: [],
    };

    expect(draft.paso_id).toBe("paso-1");
    expect(draft.grupo_edad_id).toBe("semillas");
    expect(draft.dificultad).toBe("normal");
    expect(draft.xp_recompensa).toBe(15);
  });

  it("permite limite_tiempo_seg como null", () => {
    const draft: ActivityDraft = {
      ...emptyDraft,
      limite_tiempo_seg: null,
    };

    expect(draft.limite_tiempo_seg).toBeNull();
  });
});

describe("defaultOptions", () => {
  it("genera 4 opciones A, B, C, D", () => {
    expect(defaultOptions).toHaveLength(4);
    expect(defaultOptions.map((o) => o.etiqueta)).toEqual(["A", "B", "C", "D"]);
  });

  it("la primera opción es correcta por defecto", () => {
    expect(defaultOptions[0]!.correcta).toBe(true);
    expect(defaultOptions[1]!.correcta).toBe(false);
  });

  it("las opciones tienen orden secuencial", () => {
    defaultOptions.forEach((opcion, i) => {
      expect(opcion.orden).toBe(i + 1);
    });
  });

  it("todas las opciones tienen texto vacío", () => {
    defaultOptions.forEach((opcion) => {
      expect(opcion.texto).toBe("");
    });
  });
});

describe("emptyDraft", () => {
  it("tiene valores por defecto coherentes", () => {
    expect(emptyDraft.titulo).toBe("");
    expect(emptyDraft.consigna).toBe("");
    expect(emptyDraft.xp_recompensa).toBe(10);
    expect(emptyDraft.dificultad).toBe("facil");
    expect(emptyDraft.obligatorio).toBe(true);
    expect(emptyDraft.limite_tiempo_seg).toBeNull();
    expect(emptyDraft.configuracion).toEqual({});
  });

  it("incluye las opciones por defecto", () => {
    expect(emptyDraft.opciones).toEqual(defaultOptions);
  });

  it("es una ActivityDraft completa", () => {
    const draft: ActivityDraft = emptyDraft;
    expect(draft.paso_id).toBe("");
    expect(draft.grupo_edad_id).toBe("");
    expect(draft.tipo_actividad_id).toBe("");
  });
});

describe("tieneContenidoEnBorrador", () => {
  it("devuelve false para borrador completamente vacío", () => {
    expect(tieneContenidoEnBorrador(emptyDraft)).toBe(false);
  });

  it("devuelve true si hay título", () => {
    expect(
      tieneContenidoEnBorrador({ ...emptyDraft, titulo: "Mi título" }),
    ).toBe(true);
  });

  it("devuelve true si hay consigna", () => {
    expect(
      tieneContenidoEnBorrador({ ...emptyDraft, consigna: "Mi consigna" }),
    ).toBe(true);
  });

  it("devuelve true si hay configuración", () => {
    expect(
      tieneContenidoEnBorrador({
        ...emptyDraft,
        configuracion: { algo: "valor" },
      }),
    ).toBe(true);
  });

  it("devuelve true si alguna opción tiene texto", () => {
    const conOpcionTexto: ActivityDraft = {
      ...emptyDraft,
      opciones: defaultOptions.map((o, i) =>
        i === 0 ? { ...o, texto: "Respuesta A" } : o,
      ),
    };
    expect(tieneContenidoEnBorrador(conOpcionTexto)).toBe(true);
  });

  it("devuelve false si solo opciones vacías y sin contenido", () => {
    const sinContenido = {
      titulo: "   ",
      consigna: "   ",
      configuracion: {},
      opciones: defaultOptions,
    };
    expect(tieneContenidoEnBorrador(sinContenido)).toBe(false);
  });
});

describe("actualizarGrupoEdadDelBorrador", () => {
  it("retorna un nuevo objeto con grupo_edad_id cambiado", () => {
    const resultado = actualizarGrupoEdadDelBorrador(emptyDraft, "exploradores");
    expect(resultado.grupo_edad_id).toBe("exploradores");
    expect(resultado).not.toBe(emptyDraft);
  });

  it("conserva el resto del borrador", () => {
    const original: ActivityDraft = {
      ...emptyDraft,
      titulo: "Test",
      consigna: "Consigna test",
    };
    const resultado = actualizarGrupoEdadDelBorrador(original, "embajadores");
    expect(resultado.titulo).toBe("Test");
    expect(resultado.consigna).toBe("Consigna test");
  });
});

describe("esObjetoPlano", () => {
  it("devuelve true para objeto plano", () => {
    expect(esObjetoPlano({ a: 1 })).toBe(true);
  });

  it("devuelve true para objeto vacío", () => {
    expect(esObjetoPlano({})).toBe(true);
  });

  it("devuelve false para null", () => {
    expect(esObjetoPlano(null)).toBe(false);
  });

  it("devuelve false para arrays", () => {
    expect(esObjetoPlano([1, 2, 3])).toBe(false);
  });

  it("devuelve false para Date", () => {
    expect(esObjetoPlano(new Date())).toBe(false);
  });

  it("devuelve false para funciones", () => {
    expect(esObjetoPlano(() => {})).toBe(false);
  });

  it("devuelve false para primitivos", () => {
    expect(esObjetoPlano("string")).toBe(false);
    expect(esObjetoPlano(42)).toBe(false);
    expect(esObjetoPlano(true)).toBe(false);
    expect(esObjetoPlano(undefined)).toBe(false);
  });
});
