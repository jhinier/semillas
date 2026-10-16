import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { Container } from "./container";
import { Spacer } from "./spacer";
import { AspectRatio } from "./aspect-ratio";
import { VisuallyHidden } from "./visually-hidden";
import { CloseButton } from "./close-button";

describe("componentes utilitarios", () => {
  describe("Container", () => {
    it("renderiza children correctamente", () => {
      const html = renderToStaticMarkup(
        <Container><p>Contenido</p></Container>,
      );
      expect(html).toContain("Contenido");
    });

    it("aplica variante lg por defecto", () => {
      const html = renderToStaticMarkup(
        <Container><p>Test</p></Container>,
      );
      expect(html).toContain("max-w-screen-lg");
      expect(html).toContain("mx-auto");
    });

    it("aplica variante sm", () => {
      const html = renderToStaticMarkup(
        <Container variante="sm"><p>Test</p></Container>,
      );
      expect(html).toContain("max-w-screen-sm");
    });

    it("aplica variante lg", () => {
      const html = renderToStaticMarkup(
        <Container variante="lg"><p>Test</p></Container>,
      );
      expect(html).toContain("max-w-screen-lg");
    });

    it("aplica padding sm", () => {
      const html = renderToStaticMarkup(
        <Container padding="sm"><p>Test</p></Container>,
      );
      expect(html).toContain("px-4");
    });

    it("aplica padding none", () => {
      const html = renderToStaticMarkup(
        <Container padding="none"><p>Test</p></Container>,
      );
      expect(html).not.toContain("px-4");
      expect(html).not.toContain("px-6");
    });

    it("acepta className personalizado", () => {
      const html = renderToStaticMarkup(
        <Container className="mi-clase"><p>Test</p></Container>,
      );
      expect(html).toContain("mi-clase");
    });
  });

  describe("Spacer", () => {
    it("renderiza un div con role separator", () => {
      const html = renderToStaticMarkup(<Spacer />);
      expect(html).toContain('role="separator"');
    });

    it("aplica separador vertical por defecto", () => {
      const html = renderToStaticMarkup(<Spacer />);
      expect(html).toContain('aria-orientation="vertical"');
    });

    it("aplica separador horizontal", () => {
      const html = renderToStaticMarkup(<Spacer direccion="horizontal" />);
      expect(html).toContain('aria-orientation="horizontal"');
    });

    it("aplica talla por defecto (4)", () => {
      const html = renderToStaticMarkup(<Spacer />);
      expect(html).toContain("h-4");
    });

    it("aplica talla personalizada", () => {
      const html = renderToStaticMarkup(<Spacer talla={8} />);
      expect(html).toContain("h-8");
    });

    it("aplica talla horizontal", () => {
      const html = renderToStaticMarkup(<Spacer talla={6} direccion="horizontal" />);
      expect(html).toContain("w-6");
    });

    it("acepta className personalizado", () => {
      const html = renderToStaticMarkup(<Spacer className="mi-clase" />);
      expect(html).toContain("mi-clase");
    });
  });

  describe("AspectRatio", () => {
    it("renderiza children correctamente", () => {
      const html = renderToStaticMarkup(
        <AspectRatio><div>Test</div></AspectRatio>,
      );
      expect(html).toContain("Test");
    });

    it("aplica ratio 16/9 por defecto", () => {
      const html = renderToStaticMarkup(
        <AspectRatio><div>Test</div></AspectRatio>,
      );
      expect(html).toContain("aspect-video");
    });

    it("aplica ratio 1/1", () => {
      const html = renderToStaticMarkup(
        <AspectRatio ratio="1/1"><div>Test</div></AspectRatio>,
      );
      expect(html).toContain("aspect-square");
    });

    it("aplica ratio 4/3", () => {
      const html = renderToStaticMarkup(
        <AspectRatio ratio="4/3"><div>Test</div></AspectRatio>,
      );
      expect(html).toContain("aspect-[4/3]");
    });

    it("aplica className y clases base", () => {
      const html = renderToStaticMarkup(
        <AspectRatio className="mi-clase"><div>Test</div></AspectRatio>,
      );
      expect(html).toContain("mi-clase");
      expect(html).toContain("relative");
      expect(html).toContain("overflow-hidden");
    });
  });

  describe("VisuallyHidden", () => {
    it("renderiza children", () => {
      const html = renderToStaticMarkup(
        <VisuallyHidden><span>Oculto</span></VisuallyHidden>,
      );
      expect(html).toContain("Oculto");
    });

    it("aplica clases de ocultamiento visual", () => {
      const html = renderToStaticMarkup(
        <VisuallyHidden><span>Oculto</span></VisuallyHidden>,
      );
      expect(html).toContain("absolute");
      expect(html).toContain("[clip:rect(0,0,0,0)]");
    });

    it("acepta className personalizado", () => {
      const html = renderToStaticMarkup(
        <VisuallyHidden className="mi-clase"><span>Oculto</span></VisuallyHidden>,
      );
      expect(html).toContain("mi-clase");
    });
  });

  describe("CloseButton", () => {
    it("renderiza boton con aria-label", () => {
      const html = renderToStaticMarkup(<CloseButton />);
      expect(html).toContain('aria-label="Cerrar"');
    });

    it("renderiza con label personalizado", () => {
      const html = renderToStaticMarkup(<CloseButton label="Cerrar dialogo" />);
      expect(html).toContain('aria-label="Cerrar dialogo"');
    });

    it("aplica tamaño pequeno", () => {
      const html = renderToStaticMarkup(<CloseButton tamaño="pequeno" />);
      expect(html).toContain("h-6");
      expect(html).toContain("w-6");
    });

    it("aplica tamaño mediano por defecto", () => {
      const html = renderToStaticMarkup(<CloseButton />);
      expect(html).toContain("h-8");
      expect(html).toContain("w-8");
    });

    it("acepta className personalizado", () => {
      const html = renderToStaticMarkup(<CloseButton className="mi-clase" />);
      expect(html).toContain("mi-clase");
    });
  });
});
