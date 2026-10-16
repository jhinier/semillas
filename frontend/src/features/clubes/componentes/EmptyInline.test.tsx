import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { EmptyInline } from "./EmptyInline";

describe("EmptyInline", () => {
  it("renderiza título y texto", () => {
    const html = renderToStaticMarkup(<EmptyInline title="Sin clubes" text="Aún no has creado un club" />);
    expect(html).toContain("Sin clubes");
    expect(html).toContain("Aún no has creado un club");
  });

  it("usa Trophy como icono por defecto", () => {
    const html = renderToStaticMarkup(<EmptyInline title="Vacío" text="Sin datos" />);
    expect(html).toContain("<svg");
  });

  it("renderiza botón de acción cuando se provee action", () => {
    const html = renderToStaticMarkup(
      <EmptyInline
        title="Sin clubes"
        text="Crea tu primer club"
        action={{ label: "Crear club", onClick: () => {} }}
      />,
    );
    expect(html).toContain("Crear club");
  });

  it("no renderiza botón cuando no hay acción", () => {
    const html = renderToStaticMarkup(<EmptyInline title="Vacío" text="Sin datos" />);
    expect(html).not.toContain("<button");
  });

  it("aplica clase club-empty-inline", () => {
    const html = renderToStaticMarkup(<EmptyInline title="Test" text="Test" />);
    expect(html).toContain("club-empty-inline");
  });

  it("acepta icono personalizado", () => {
    const CustomIcon = ({ size }: { size?: number }) => <span data-testid="custom-icon" data-size={size}>★</span>;

    const html = renderToStaticMarkup(
      <EmptyInline
        title="Test"
        text="Test"
        icon={CustomIcon}
      />,
    );
    expect(html).toContain("custom-icon");
  });

  it("ejecuta onClick cuando se hace click en acción", () => {
    let clicked = false;
    const html = renderToStaticMarkup(
      <EmptyInline
        title="Test"
        text="Test"
        action={{ label: "Acción", onClick: () => { clicked = true; } }}
      />,
    );
    expect(html).toContain("Acción");
    expect(clicked).toBe(false);
  });
});
