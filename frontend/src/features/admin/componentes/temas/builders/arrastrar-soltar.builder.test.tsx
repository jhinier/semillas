import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ArrastrarSoltarBuilder } from "./arrastrar-soltar.builder";

describe("ArrastrarSoltarBuilder", () => {
  const render = (ui: React.ReactElement) => renderToStaticMarkup(ui);

  it("renderiza la secuencia correcta", () => {
    const html = render(
      <ArrastrarSoltarBuilder
        configuracion={{ items: ["Primero", "Segundo"], orden_correcto: [0, 1] }}
        onChange={() => {}}
      />,
    );

    expect(html).toContain("Secuencia correcta");
    expect(html).toContain("Primero");
    expect(html).toContain("Segundo");
  });

  it("muestra el botón para agregar pasos", () => {
    const html = render(<ArrastrarSoltarBuilder configuracion={{}} onChange={() => {}} />);
    expect(html).toContain("Agregar paso");
  });
});
