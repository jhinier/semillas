import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { TemasSearchBar } from "./temas-search-bar";

describe("TemasSearchBar mobile", () => {
  it("se muestra en móvil y permite limpiar la búsqueda", () => {
    const html = renderToStaticMarkup(
      <TemasSearchBar valor="semilla" onChange={() => undefined} />,
    );

    expect(html).toContain("Buscar por título o descripción");
    expect(html).toContain("Limpiar búsqueda");
    expect(html).not.toContain("hidden gap-4 mb-6 flex-wrap md:flex");
  });
});
