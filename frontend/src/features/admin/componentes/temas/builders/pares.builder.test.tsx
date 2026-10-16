import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ParesBuilder } from "./pares.builder";
import type { Par } from "../activity-config-utils";

describe("ParesBuilder", () => {
  const render = (ui: React.ReactElement) => renderToStaticMarkup(ui);

  it("renderiza pares proporcionados", () => {
    const pares: Par[] = [
      { id: "par-1", izquierda: "Fe", derecha: "Confiar en Dios" },
    ];
    const html = render(<ParesBuilder pares={pares} onChange={() => {}} />);
    expect(html).toContain("Fe");
    expect(html).toContain("Confiar en Dios");
  });

  it("muestra placeholders para concepto y respuesta", () => {
    const html = render(<ParesBuilder pares={[{ id: "par-1", izquierda: "", derecha: "" }]} onChange={() => {}} />);
    expect(html).toContain("Concepto");
    expect(html).toContain("Respuesta");
  });

  it("provee un par inicial cuando array está vacío", () => {
    const html = render(<ParesBuilder pares={[]} onChange={() => {}} />);
    expect(html).toContain("Agregar par");
  });

  it("ofrece botón para agregar par", () => {
    const html = render(
      <ParesBuilder pares={[{ id: "par-1", izquierda: "A", derecha: "B" }]} onChange={() => {}} />,
    );
    expect(html).toContain("Agregar par");
  });

  it("tiene botón eliminar por cada par", () => {
    const pares: Par[] = [
      { id: "par-1", izquierda: "A", derecha: "B" },
      { id: "par-2", izquierda: "C", derecha: "D" },
    ];
    const html = render(<ParesBuilder pares={pares} onChange={() => {}} />);
    const deleteButtons = html.match(/Eliminar par/g);
    expect(deleteButtons).toHaveLength(2);
  });
});
