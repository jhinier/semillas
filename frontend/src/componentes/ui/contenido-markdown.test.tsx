import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ContenidoMarkdown, limpiarMarkdownATextoPlano } from "./contenido-markdown";

describe("ContenidoMarkdown", () => {
  it("renderiza encabezados, negritas y listas en HTML semántico sin sintaxis cruda", () => {
    const html = renderToStaticMarkup(
      <ContenidoMarkdown
        texto={"# ¿Alguna vez has sentido miedo?\n\n**¡Prepárate!**\n\n- Punto uno\n- Punto dos"}
      />,
    );

    expect(html).toContain("<h2");
    expect(html).toContain("¿Alguna vez has sentido miedo?");
    expect(html).toContain("<strong>¡Prepárate!</strong>");
    expect(html).toContain("<ul");
    expect(html).toContain("<li");
    expect(html).toContain(">Punto uno</li>");
    expect(html).not.toContain("# ");
    expect(html).not.toContain("**");
  });

  it("bloquea enlaces javascript: inseguros y limpia markdown para narración", () => {
    const html = renderToStaticMarkup(
      <ContenidoMarkdown texto="[clic aquí](javascript:alert(1)) y **paz**" />,
    );
    expect(html).not.toContain("javascript:");
    expect(html).toContain("clic aquí");

    const plano = limpiarMarkdownATextoPlano("# Título\n\n**Hola** [amigo](https://ejemplo.com)");
    expect(plano).toBe("Título. Hola amigo");
  });
});
