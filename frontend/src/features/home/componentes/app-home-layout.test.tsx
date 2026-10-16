import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ResumenProgreso } from "./resumen-progreso";
import { VersiculoDelDia } from "./versiculo-del-dia";

describe("home dashboard layout", () => {
  it("expone únicamente métricas respaldadas por la API actual", () => {
    const html = renderToStaticMarkup(
      <ResumenProgreso
        xpTotal={1240}
        numeroNivel={7}
        nombreNivel="Explorador"
        totalInsignias={3}
      />,
    );

    expect(html).toContain('aria-label="Resumen de progreso"');
    expect(html).toContain("Nivel");
    expect(html).toContain("XP");
    expect(html).toContain("Insignias");
    expect(html).not.toContain("Racha");
  });

  it("permite expandir un versículo largo", () => {
    const html = renderToStaticMarkup(
      <VersiculoDelDia
        texto="Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree no se pierda, mas tenga vida eterna."
        referencia="Juan 3:16"
      />,
    );

    expect(html).toContain("Leer completo");
    expect(html).toContain("Versículo");
  });
});
