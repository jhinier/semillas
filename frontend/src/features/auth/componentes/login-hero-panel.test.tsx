import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { LoginHeroPanel } from "./login-hero-panel";

describe("LoginHeroPanel", () => {
  it("muestra la nueva tarjeta visual y los beneficios", () => {
    const html = renderToStaticMarkup(<LoginHeroPanel />);

    expect(html).toContain("login-illustration-card");
    expect(html).toContain("Tu progreso se sincroniza");
    expect(html).toContain("Un entorno seguro");
    expect(html).toContain("Privacidad protegida");
  });
});
