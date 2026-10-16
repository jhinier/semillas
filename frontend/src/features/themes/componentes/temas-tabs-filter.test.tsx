import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { TemasTabsFilter } from "./temas-tabs-filter";

describe("TemasTabsFilter", () => {
  it("muestra tabs compactas con contadores", () => {
    const html = renderToStaticMarkup(
      <TemasTabsFilter
        activo="favoritos"
        onChange={() => undefined}
        counts={{ todos: 12, completados: 4, progreso: 2, favoritos: 3 }}
      />,
    );

    expect(html).toContain("Todos");
    expect(html).toContain("Favoritos");
    expect(html).toContain(">3<");
    expect(html).toContain("temas-tabs-scroll");
  });
});
