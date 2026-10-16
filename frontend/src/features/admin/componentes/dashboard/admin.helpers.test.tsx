import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { BotonAccion, CheckboxCell } from "./admin.helpers";

describe("admin.helpers", () => {
  it("expone nombre accesible en botones icon-only", () => {
    const html = renderToStaticMarkup(
      <BotonAccion title="Editar tema" icon="fa-pencil" />,
    );

    expect(html).toContain('aria-label="Editar tema"');
    expect(html).toContain('aria-hidden="true"');
  });

  it("expone nombre accesible en checkboxes compartidos", () => {
    const html = renderToStaticMarkup(<table><tbody><tr><CheckboxCell ariaLabel="Seleccionar tema" /></tr></tbody></table>);

    expect(html).toContain('aria-label="Seleccionar tema"');
  });
});
