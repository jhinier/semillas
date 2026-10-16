import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { RelacionarConceptos } from "./RelacionarConceptos";

describe("RelacionarConceptos", () => {
  it("renderiza encabezado, instrucciones, conceptos y relaciones accesibles", () => {
    const html = renderToStaticMarkup(
      <RelacionarConceptos
        titulo="Une cada personaje"
        descripcion="Relaciona cada personaje con su historia."
        xp={25}
        mostrarPistas
        pares={[
          { id: "noe", concepto: "Noe", relacion: "Construyo el arca", pista: "Hubo lluvia" },
          { id: "david", concepto: "David", relacion: "Vencio a Goliat", pista: "Uso una piedra" },
        ]}
      />,
    );

    expect(html).toContain("Une cada personaje");
    expect(html).toContain("Relaciona cada personaje con su historia.");
    expect(html).toContain("25 XP");
    expect(html).toContain("Toca o arrastra un concepto hacia su pareja.");
    expect(html).toContain('aria-label="Concepto Noe"');
    expect(html).toContain('aria-label="Relacion Construyo el arca"');
    expect(html).toContain("Hubo lluvia");
  });

  it("no rearma la notificacion de completado al reiniciar visualmente", async () => {
    const codigo = await Bun.file(new URL("./RelacionarConceptos.tsx", import.meta.url)).text();
    const reiniciarActividad = codigo.match(/function reiniciarActividad\(\) \{[\s\S]*?\n  \}/)?.[0] ?? "";

    expect(reiniciarActividad).not.toContain("completoNotificado.current = false");
  });
});
