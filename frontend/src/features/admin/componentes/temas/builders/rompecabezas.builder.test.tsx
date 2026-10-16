import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { RompecabezasBuilder } from "./rompecabezas.builder";

describe("RompecabezasBuilder", () => {
  const render = (ui: React.ReactElement) => renderToStaticMarkup(ui);

  it("renderiza selector de biblioteca y dimensiones", () => {
    const html = render(
      <RompecabezasBuilder
        configuracion={{ imagen: "", filas: 3, columnas: 3 }}
        onChange={() => {}}
        onUpload={() => {}}
        resources={[]}
        uploading={false}
      />,
    );

    expect(html).toContain("Abrir biblioteca");
    expect(html).toContain("Filas");
    expect(html).toContain("Columnas");
  });
});
