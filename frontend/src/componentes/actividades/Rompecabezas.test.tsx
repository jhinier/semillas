import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { Rompecabezas } from "./Rompecabezas";

describe("Rompecabezas", () => {
  it("renderiza ayuda, tablero y piezas accesibles", () => {
    const html = renderToStaticMarkup(
      <Rompecabezas
        imagen="/demo/tema.png"
        filas={2}
        columnas={2}
      />,
    );

    expect(html).toContain("Toca o arrastra dos piezas para intercambiarlas.");
    expect(html).toContain('aria-label="Pieza 1 de 4"');
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-describedby="rompecabezas-ayuda"');
    expect(html).toContain("background-size:200% 200%");
  });

  it("normaliza dimensiones invalidas antes de renderizar", () => {
    const html = renderToStaticMarkup(<Rompecabezas imagen="/demo/tema.png" filas={2.8} columnas={0} />);

    expect(html).toContain('aria-label="Rompecabezas de 2 por 1"');
    expect(html).toContain('aria-label="Pieza 1 de 2"');
    expect(html).toContain('aria-label="Pieza 2 de 2"');
    expect(html).not.toContain('aria-label="Pieza 3 de');
    expect(html).toContain("grid-template-columns:repeat(1, 1fr)");
    expect(html).toContain("grid-template-rows:repeat(2, 1fr)");
  });
});
