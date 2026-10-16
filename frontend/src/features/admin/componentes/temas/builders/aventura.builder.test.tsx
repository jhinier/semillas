import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { AventuraBuilder } from "./aventura.builder";
import type { ConfiguracionActividad } from "../activity-config-utils";

describe("AventuraBuilder", () => {
  const render = (ui: React.ReactElement) => renderToStaticMarkup(ui);

  it("renderiza escenas proporcionadas", () => {
    const config: ConfiguracionActividad = {
      escenas: [{
        id: "escena-1",
        texto: "Llegaste al río",
        imagen_url: "",
        opciones: [{ id: "op-1", texto: "Cruzar nadando", correcta: true }],
      }],
    };
    const html = render(<AventuraBuilder configuracion={config} onChange={() => {}} />);
    expect(html).toContain("Escena 1");
    expect(html).toContain("Llegaste al río");
  });

  it("provee una escena inicial cuando escenas está vacío", () => {
    const config: ConfiguracionActividad = { escenas: [] };
    const html = render(<AventuraBuilder configuracion={config} onChange={() => {}} />);
    expect(html).toContain("Agregar escena");
  });

  it("muestra botón para agregar escena", () => {
    const config: ConfiguracionActividad = {
      escenas: [{
        id: "escena-1",
        texto: "Test",
        imagen_url: "",
        opciones: [],
      }],
    };
    const html = render(<AventuraBuilder configuracion={config} onChange={() => {}} />);
    expect(html).toContain("Agregar escena");
  });

  it("renderiza opciones de cada escena", () => {
    const config: ConfiguracionActividad = {
      escenas: [{
        id: "escena-1",
        texto: "Elige tu camino",
        imagen_url: "",
        opciones: [
          { id: "op-1", texto: "Camino A", correcta: true },
          { id: "op-2", texto: "Camino B", correcta: false },
        ],
      }],
    };
    const html = render(<AventuraBuilder configuracion={config} onChange={() => {}} />);
    expect(html).toContain("Camino A");
    expect(html).toContain("Camino B");
    expect(html).toContain("Opciones");
  });
});
