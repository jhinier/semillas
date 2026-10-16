import { describe, expect, it } from "bun:test";

import { esEnlaceLandingActivo, obtenerHrefLandingInicial } from "./Navbar.helpers";

describe("Navbar.helpers", () => {
  it("usa #top como hash inicial cuando no hay fragmento en la URL", () => {
    expect(obtenerHrefLandingInicial()).toBe("#top");
  });

  it("marca como activo el enlace que coincide con el hash actual", () => {
    expect(esEnlaceLandingActivo("#sendas", "#sendas")).toBe(true);
    expect(esEnlaceLandingActivo("#sendas", "#top")).toBe(false);
  });
});
