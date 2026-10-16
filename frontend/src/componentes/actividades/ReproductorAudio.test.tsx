import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ReproductorAudio } from "./ReproductorAudio";

describe("ReproductorAudio", () => {
  it("renderiza el componente sin crashear", () => {
    const html = renderToStaticMarkup(
      <ReproductorAudio src="test.mp3" />,
    );
    expect(html).toContain("Actividad Audio");
  });

  it("renderiza el boton de play cuando no esta reproduciendo", () => {
    const html = renderToStaticMarkup(
      <ReproductorAudio src="test.mp3" />,
    );
    expect(html).toContain("lucide-play");
  });

  it("renderiza la barra de progreso", () => {
    const html = renderToStaticMarkup(
      <ReproductorAudio src="test.mp3" />,
    );
    expect(html).toContain("bg-amber-200");
  });

  it("renderiza controles de tiempo", () => {
    const html = renderToStaticMarkup(
      <ReproductorAudio src="test.mp3" />,
    );
    expect(html).toContain("0:00");
  });

  it("acepta src sin usar audio demo", () => {
    const html = renderToStaticMarkup(
      <ReproductorAudio src="https://example.com/cancion.mp3" />,
    );
    expect(html).toContain('src="https://example.com/cancion.mp3"');
  });

  it("incluye elemento audio con src", () => {
    const html = renderToStaticMarkup(
      <ReproductorAudio src="test.mp3" />,
    );
    expect(html).toContain("<audio");
    expect(html).toContain('src="test.mp3"');
  });

  it("renderiza icono de musica", () => {
    const html = renderToStaticMarkup(
      <ReproductorAudio src="test.mp3" />,
    );
    expect(html).toContain("lucide-music");
  });
});