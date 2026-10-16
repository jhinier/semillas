import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { CuestionarioBuilder } from "./cuestionario.builder";

describe("CuestionarioBuilder", () => {
  const render = (ui: React.ReactElement) => renderToStaticMarkup(ui);

  it("renderiza opciones con una correcta", () => {
    const html = render(
      <CuestionarioBuilder
        configuracion={{
          opciones: [
            { id: "op-1", texto: "A", correcta: true },
            { id: "op-2", texto: "B", correcta: false },
          ],
        }}
        onChange={() => {}}
      />,
    );

    expect(html).toContain("Opciones");
    expect(html).toContain("Correcta");
    expect(html).toContain("Agregar opción");
  });

  it("muestra una fila inicial cuando no hay opciones", () => {
    const html = render(<CuestionarioBuilder configuracion={{}} onChange={() => {}} />);
    expect(html).toContain("Agregar opción");
  });
});
