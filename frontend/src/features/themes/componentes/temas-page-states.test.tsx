import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { TemasEmptyState, TemasErrorState, TemasLoadingState } from "./temas-page-states";

describe("Temas page states", () => {
  it("muestra el CTA para limpiar filtros en el estado vacío", () => {
    const html = renderToStaticMarkup(<TemasEmptyState onReset={() => undefined} />);

    expect(html).toContain("Ver todos los temas");
  });

  it("renderiza skeletons de carga", () => {
    const html = renderToStaticMarkup(<TemasLoadingState />);

    expect(html).toContain("aria-label=\"Cargando temas\"");
    expect(html).toContain("animate-pulse");
  });

  it("muestra un error más claro", () => {
    const html = renderToStaticMarkup(<TemasErrorState />);

    expect(html).toContain("No pudimos cargar los temas");
  });
});
