import { describe, expect, it } from "bun:test";
import { debeSolicitarPortada } from "./usePortadasFirmadas";

describe("debeSolicitarPortada", () => {
  it("habilita la portada cuando existe portada_recurso_id", () => {
    expect(
      debeSolicitarPortada({
        id: "tema-1",
        senda_id: "senda-1",
        titulo: "Tema",
        slug: "tema",
        objetivo: "Objetivo",
        resumen: null,
        portada_recurso_id: "recurso-1",
        estado: "publicado",
        version_biblica_id: null,
        xp_recompensa: 10,
        minutos_estimados: 5,
        version_contenido: 1,
        publicado_en: null,
      }),
    ).toBe(true);
  });

  it("habilita la portada cuando existe portada anidada", () => {
    expect(
      debeSolicitarPortada({
        id: "tema-1",
        senda_id: "senda-1",
        titulo: "Tema",
        slug: "tema",
        objetivo: "Objetivo",
        resumen: null,
        portada_recurso_id: null,
        portada: { id: "recurso-1", url_publica: "https://cdn.ejemplo.com/portada.png", texto_alternativo: null, titulo: null },
        estado: "publicado",
        version_biblica_id: null,
        xp_recompensa: 10,
        minutos_estimados: 5,
        version_contenido: 1,
        publicado_en: null,
      }),
    ).toBe(true);
  });

  it("deshabilita la portada cuando no hay recurso", () => {
    expect(
      debeSolicitarPortada({
        id: "tema-1",
        senda_id: "senda-1",
        titulo: "Tema",
        slug: "tema",
        objetivo: "Objetivo",
        resumen: null,
        portada_recurso_id: null,
        portada: null,
        estado: "publicado",
        version_biblica_id: null,
        xp_recompensa: 10,
        minutos_estimados: 5,
        version_contenido: 1,
        publicado_en: null,
      }),
    ).toBe(false);
  });
});
