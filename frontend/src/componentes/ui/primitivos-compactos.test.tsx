import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { BloqueIconoTexto } from "./bloque-icono-texto";
import { TarjetaMetricaCompacta } from "./card-metrica";
import { FilaListaCompacta } from "./fila-lista-compacta";

describe("primitivos compactos", () => {
  it("renderiza la tarjeta de métrica compacta con icono, valor y subtexto", () => {
    const html = renderToStaticMarkup(
      <TarjetaMetricaCompacta
        titulo="Temas publicados"
        valor={18}
        subtexto="5 temas listos"
        icono={<span>TM</span>}
      />,
    );

    expect(html).toContain("Temas publicados");
    expect(html).toContain(">18<");
    expect(html).toContain("5 temas listos");
    expect(html).toContain("TM");
  });

  it("renderiza la fila compacta con contenido lateral y derecho", () => {
    const html = renderToStaticMarkup(
      <FilaListaCompacta
        izquierda={<span>IC</span>}
        titulo="Revisión semanal"
        subtitulo="Mañana"
        derecha={<span>OK</span>}
      />,
    );

    expect(html).toContain("Revisión semanal");
    expect(html).toContain("Mañana");
    expect(html).toContain("IC");
    expect(html).toContain("OK");
  });

  it("preserva atributos DOM en la fila compacta interactiva", () => {
    const html = renderToStaticMarkup(
      <FilaListaCompacta
        izquierda={<span>IC</span>}
        titulo="Interactiva"
        onClick={() => undefined}
        data-testid="fila-compacta"
        aria-label="Fila compacta interactiva"
      />,
    );

    expect(html).toContain('data-testid="fila-compacta"');
    expect(html).toContain('aria-label="Fila compacta interactiva"');
    expect(html).toContain('<button');
  });

  it("renderiza el bloque icono+texto con clases personalizadas", () => {
    const html = renderToStaticMarkup(
      <BloqueIconoTexto
        icono={<span>BI</span>}
        titulo="Bloque"
        descripcion="Descripcion"
        iconoCajaClassName="bg-red-50"
        tituloClassName="text-red-700"
        descripcionClassName="text-red-500"
      />,
    );

    expect(html).toContain("Bloque");
    expect(html).toContain("Descripcion");
    expect(html).toContain("BI");
    expect(html).toContain("bg-red-50");
  });
});
