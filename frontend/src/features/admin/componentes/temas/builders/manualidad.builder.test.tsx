import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ManualidadBuilder } from "./manualidad.builder";

describe("ManualidadBuilder", () => {
  const render = (ui: React.ReactElement) => renderToStaticMarkup(ui);

  it("renderiza materiales y pasos", () => {
    const html = render(
      <ManualidadBuilder
        configuracion={{ materiales: ["Papel"], pasos: ["Dobla", "Recorta"] }}
        onChange={() => {}}
      />,
    );

    expect(html).toContain("Materiales");
    expect(html).toContain("Pasos");
    expect(html).toContain("Papel");
  });

  it("muestra botones para agregar materiales y pasos", () => {
    const html = render(<ManualidadBuilder configuracion={{}} onChange={() => {}} />);
    expect(html).toContain("Agregar material");
    expect(html).toContain("Agregar paso");
  });
});
