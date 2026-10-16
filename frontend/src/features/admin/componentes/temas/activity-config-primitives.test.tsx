import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { CampoConfiguracion, AreaConfiguracion } from "./activity-config-primitives";

describe("CampoConfiguracion", () => {
  const render = (ui: React.ReactElement) => renderToStaticMarkup(ui);

  it("renderiza el label proporcionado", () => {
    const html = render(<CampoConfiguracion label="Pregunta" value="" onChange={() => {}} />);
    expect(html).toContain("Pregunta");
  });

  it("renderiza el valor proporcionado", () => {
    const html = render(<CampoConfiguracion label="Título" value="Mi actividad" onChange={() => {}} />);
    expect(html).toContain("Mi actividad");
  });

  it("usa input text por defecto", () => {
    const html = render(<CampoConfiguracion label="Test" value="valor" onChange={() => {}} />);
    expect(html).toContain('type="text"');
  });

  it("usa input number cuando type es number", () => {
    const html = render(<CampoConfiguracion label="Filas" value="3" type="number" onChange={() => {}} />);
    expect(html).toContain('type="number"');
  });

  it("muestra texto de ayuda cuando está presente", () => {
    const html = render(
      <CampoConfiguracion label="Test" value="" onChange={() => {}} help="Ayuda útil" />,
    );
    expect(html).toContain("Ayuda útil");
  });

  it("no muestra help cuando no existe", () => {
    const html = render(<CampoConfiguracion label="Test" value="" onChange={() => {}} />);
    expect(html).not.toContain("<small>");
  });
});

describe("AreaConfiguracion", () => {
  const render = (ui: React.ReactElement) => renderToStaticMarkup(ui);

  it("renderiza el label proporcionado", () => {
    const html = render(<AreaConfiguracion label="Frase" value="" onChange={() => {}} />);
    expect(html).toContain("Frase");
  });

  it("renderiza textarea con el valor", () => {
    const html = render(<AreaConfiguracion label="Descripción" value="Texto largo" onChange={() => {}} />);
    expect(html).toContain("Texto largo");
  });

  it("usa rows=4 por defecto", () => {
    const html = render(<AreaConfiguracion label="Test" value="" onChange={() => {}} />);
    expect(html).toContain('rows="4"');
  });

  it("muestra texto de ayuda cuando está presente", () => {
    const html = render(
      <AreaConfiguracion label="Test" value="" onChange={() => {}} help="Usa __ para el hueco" />,
    );
    expect(html).toContain("Usa __ para el hueco");
  });
});
