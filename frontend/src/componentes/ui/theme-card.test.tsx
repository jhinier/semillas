import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ThemeCard } from "./theme-card";

describe("ThemeCard mobile CTA", () => {
  it("expone un layout compacto para móvil", () => {
    const html = renderToStaticMarkup(
      <ThemeCard
        senda="Senda del Padre"
        titulo="La Creación del Mundo"
        descripcion="Descubre cómo Dios creó los cielos y la tierra."
        duracion="10 min"
        xp={100}
        estado="porDefecto"
        onAccion={() => undefined}
        layoutMovil="lista"
      />,
    );

    expect(html).toContain("Empezar tema");
    expect(html).toContain("max-w-[240px]");
    expect(html).toContain("py-3");
    expect(html).toContain("theme-card--mobile-list");
  });

  it("ajusta la acción según el estado del tema", () => {
    const enProgreso = renderToStaticMarkup(
      <ThemeCard
        senda="Senda del Padre"
        titulo="La Creación del Mundo"
        descripcion="Descubre cómo Dios creó los cielos y la tierra."
        duracion="10 min"
        xp={100}
        estado="enProgreso"
      />,
    );

    const completada = renderToStaticMarkup(
      <ThemeCard
        senda="Senda del Padre"
        titulo="La Creación del Mundo"
        descripcion="Descubre cómo Dios creó los cielos y la tierra."
        duracion="10 min"
        xp={100}
        estado="completada"
      />,
    );

    expect(enProgreso).toContain("Continuar tema");
    expect(completada).toContain("Repasar tema");
  });
});
