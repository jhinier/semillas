import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { TarjetasBuilder } from "./tarjetas.builder";
import type { Tarjeta } from "../activity-config-utils";

describe("TarjetasBuilder", () => {
  const render = (ui: React.ReactElement) => renderToStaticMarkup(ui);

  it("renderiza tarjetas proporcionadas", () => {
    const tarjetas: Tarjeta[] = [
      { id: "verso-1", texto: "Juan 3:16" },
    ];
    const html = render(<TarjetasBuilder tarjetas={tarjetas} onChange={() => {}} />);
    expect(html).toContain("verso-1");
    expect(html).toContain("Juan 3:16");
  });

  it("provee una tarjeta inicial cuando array está vacío", () => {
    const html = render(<TarjetasBuilder tarjetas={[]} onChange={() => {}} />);
    expect(html).toContain("Agregar tarjeta");
  });

  it("ofrece botón para agregar tarjeta", () => {
    const html = render(
      <TarjetasBuilder tarjetas={[{ id: "t-1", texto: "Test" }]} onChange={() => {}} />,
    );
    expect(html).toContain("Agregar tarjeta");
  });

  it("tiene campo para identificador y texto de cada tarjeta", () => {
    const tarjetas: Tarjeta[] = [
      { id: "verso-1", texto: "Juan 3:16" },
    ];
    const html = render(<TarjetasBuilder tarjetas={tarjetas} onChange={() => {}} />);
    expect(html).toContain("Identificador de tarjeta 1");
    expect(html).toContain("Texto de tarjeta 1");
  });
});
