import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { SopaLetrasBuilder } from "./sopa-letras.builder";

describe("SopaLetrasBuilder", () => {
  const render = (ui: React.ReactElement) => renderToStaticMarkup(ui);

  it("renderiza palabras y dimensiones", () => {
    const html = render(
      <SopaLetrasBuilder
        configuracion={{ palabras: ["Fe", "Amor"], filas: 12, columnas: 12 }}
        onChange={() => {}}
      />,
    );

    expect(html).toContain("Palabras");
    expect(html).toContain("Filas");
    expect(html).toContain("Columnas");
  });

  it("muestra el botón para agregar palabras", () => {
    const html = render(<SopaLetrasBuilder configuracion={{}} onChange={() => {}} />);
    expect(html).toContain("Agregar palabra");
  });
});
