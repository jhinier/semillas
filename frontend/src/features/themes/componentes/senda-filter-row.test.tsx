import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { SendaFilterRow } from "./senda-filter-row";

describe("SendaFilterRow", () => {
  it("usa etiquetas cortas y estado activo accesible", () => {
    const html = renderToStaticMarkup(
      <SendaFilterRow searchSenda="padre" onSendaChange={() => undefined} />,
    );

    expect(html).toContain("Todas");
    expect(html).toContain("Padre");
    expect(html).toContain("aria-pressed=\"true\"");
    expect(html).toContain("temas-senda-scroll");
  });
});
