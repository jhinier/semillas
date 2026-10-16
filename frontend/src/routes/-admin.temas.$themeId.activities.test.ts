import { describe, expect, it } from "bun:test";

import {
  actualizarGrupoEdadDelBorrador,
  tieneContenidoEnBorrador,
  type ActivityDraft,
} from "../features/admin/types";

const borradorVacio: ActivityDraft = {
  paso_id: "paso-1",
  grupo_edad_id: "franja-1",
  tipo_actividad_id: "tipo-1",
  titulo: "",
  consigna: "",
  retroalimentacion: "",
  xp_recompensa: 10,
  limite_tiempo_seg: null,
  dificultad: "facil",
  obligatorio: true,
  configuracion: {},
  opciones: [],
};

describe("borrador de actividad por franja", () => {
  it("detecta contenido que debe confirmarse antes de cambiar la franja", () => {
    expect(tieneContenidoEnBorrador(borradorVacio)).toBe(false);
    expect(tieneContenidoEnBorrador({ ...borradorVacio, titulo: "Quiz de Noé" })).toBe(true);
    expect(tieneContenidoEnBorrador({ ...borradorVacio, configuracion: { imagen: "https://ejemplo.test/noe.png" } })).toBe(true);
    expect(tieneContenidoEnBorrador({ ...borradorVacio, opciones: [{ etiqueta: "A", texto: "Arca", correcta: true, orden: 1 }] })).toBe(true);
  });

  it("al cambiar de franja conserva todo el contenido del borrador", () => {
    const borrador = {
      ...borradorVacio,
      titulo: "Quiz de Noé",
      consigna: "Elige la respuesta correcta",
      configuracion: { intentos: 3 },
      opciones: [{ etiqueta: "A", texto: "Arca", correcta: true, orden: 1 }],
    };

    expect(actualizarGrupoEdadDelBorrador(borrador, "franja-2")).toEqual({
      ...borrador,
      grupo_edad_id: "franja-2",
    });
  });
});
