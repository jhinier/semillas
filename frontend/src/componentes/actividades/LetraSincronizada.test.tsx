import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { LetraSincronizada } from "./LetraSincronizada";

describe("LetraSincronizada", () => {
  const letraValida = "[00:00.00]Primera\n[00:02.00]Segunda\n[00:04.00]Tercera";

  it("renderiza todas las lineas de la letra", () => {
    const html = renderToStaticMarkup(
      <LetraSincronizada letra={letraValida} currentTime={0} />,
    );
    expect(html).toContain("Primera");
    expect(html).toContain("Segunda");
    expect(html).toContain("Tercera");
  });

  it("renderiza el titulo de la seccion", () => {
    const html = renderToStaticMarkup(
      <LetraSincronizada letra={letraValida} currentTime={0} />,
    );
    expect(html).toContain("Letra de la canción");
  });

  it("muestra texto plano cuando no hay timestamps", () => {
    const letraSinTiempos = "Esta es una letra\nsin timestamps";
    const html = renderToStaticMarkup(
      <LetraSincronizada letra={letraSinTiempos} currentTime={0} />,
    );
    expect(html).toContain("Esta es una letra");
    expect(html).toContain("sin timestamps");
  });

  it("marca linea activa con clase amber-600", () => {
    const html = renderToStaticMarkup(
      <LetraSincronizada letra={letraValida} currentTime={2500} />,
    );
    expect(html).toContain("amber-600");
  });

  it("marca lineas pasadas con clase slate-700", () => {
    const html = renderToStaticMarkup(
      <LetraSincronizada letra={letraValida} currentTime={5000} />,
    );
    expect(html).toContain("slate-700");
  });

  it("marca lineas futuras con clase slate-300", () => {
    const html = renderToStaticMarkup(
      <LetraSincronizada letra={letraValida} currentTime={0} />,
    );
    expect(html).toContain("slate-300");
  });

  it("renderiza linea vacia cuando el texto esta vacio", () => {
    const letraConEspacios = "[00:00.00] \n[00:01.00]Texto";
    const html = renderToStaticMarkup(
      <LetraSincronizada letra={letraConEspacios} currentTime={0} />,
    );
    expect(html).toContain(" ");
  });

  it("maneja letra sin tiempos activos", () => {
    const html = renderToStaticMarkup(
      <LetraSincronizada letra="" currentTime={0} />,
    );
    expect(html).toContain("Letra de la canción");
  });
});