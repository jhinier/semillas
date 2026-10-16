import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ResumenTemasCard } from "./resumen-temas-card";

describe("ResumenTemasCard", () => {
  it("renderiza la variante compacta para móvil", () => {
    const html = renderToStaticMarkup(
      <ResumenTemasCard totales={12} completados={4} enProgreso={2} variante="inline" />,
    );

    expect(html).toContain("Temas");
    expect(html).toContain("Completados");
    expect(html).toContain("En progreso");
  });
});
