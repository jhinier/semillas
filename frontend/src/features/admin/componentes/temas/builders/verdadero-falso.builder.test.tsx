import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { VerdaderoFalsoBuilder } from "./verdadero-falso.builder";
import type { Afirmacion } from "../activity-config-utils";

describe("VerdaderoFalsoBuilder", () => {
  const render = (ui: React.ReactElement) => renderToStaticMarkup(ui);

  it("renderiza afirmaciones proporcionadas", () => {
    const afirmaciones: Afirmacion[] = [
      { id: "af-1", texto: "Dios es amor", es_verdadero: true },
      { id: "af-2", texto: "Jesús nunca perdonó", es_verdadero: false },
    ];
    const html = render(<VerdaderoFalsoBuilder afirmaciones={afirmaciones} onChange={() => {}} />);
    expect(html).toContain("Dios es amor");
    expect(html).toContain("Jesús nunca perdonó");
  });

  it("muestra selectores verdadera/falsa", () => {
    const afirmaciones: Afirmacion[] = [
      { id: "af-1", texto: "Test", es_verdadero: true },
    ];
    const html = render(<VerdaderoFalsoBuilder afirmaciones={afirmaciones} onChange={() => {}} />);
    expect(html).toContain("Verdadera");
    expect(html).toContain("Falsa");
  });

  it("provee una afirmación inicial cuando array está vacío", () => {
    const html = render(<VerdaderoFalsoBuilder afirmaciones={[]} onChange={() => {}} />);
    expect(html).toContain("Agregar afirmación");
  });

  it("ofrece botón para agregar afirmación", () => {
    const html = render(
      <VerdaderoFalsoBuilder afirmaciones={[{ id: "af-1", texto: "Test", es_verdadero: true }]} onChange={() => {}} />,
    );
    expect(html).toContain("Agregar afirmación");
  });

  it("tiene botón eliminar por cada afirmación", () => {
    const afirmaciones: Afirmacion[] = [
      { id: "af-1", texto: "Uno", es_verdadero: true },
      { id: "af-2", texto: "Dos", es_verdadero: false },
    ];
    const html = render(<VerdaderoFalsoBuilder afirmaciones={afirmaciones} onChange={() => {}} />);
    const deleteButtons = html.match(/Eliminar afirmación/g);
    expect(deleteButtons).toHaveLength(2);
  });
});
