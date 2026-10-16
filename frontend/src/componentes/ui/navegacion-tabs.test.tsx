import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { CampoBusqueda, TabsOpciones } from "./navegacion-tabs";

describe("navegacion-tabs", () => {
  it("renderiza tabs con conteo y estado activo", () => {
    const html = renderToStaticMarkup(
      <TabsOpciones
        activo="revision"
        onCambiar={() => undefined}
        opciones={[
          { id: "todos", label: "Todos", count: 12, badgeClassName: "bg-slate-100 text-slate-700" },
          { id: "revision", label: "En revisión", count: 3, badgeClassName: "bg-[#6c3aed]/10 text-[#6c3aed] font-bold" },
          { id: "publicado", label: "Publicados", count: 8, badgeClassName: "bg-[#2e9e5b]/10 text-[#2e9e5b] font-bold" },
        ]}
      />,
    );

    expect(html).toContain("En revisión");
    expect(html).toContain(">3<");
    expect(html).toContain("text-[#2e9e5b]");
    expect(html).toContain("text-slate-500");
  });

  it("renderiza el buscador compartido con placeholder y valor", () => {
    const html = renderToStaticMarkup(
      <CampoBusqueda valor="semilla" onChange={() => undefined} placeholder="Buscar temas..." />,
    );

    expect(html).toContain('placeholder="Buscar temas..."');
    expect(html).toContain('value="semilla"');
    expect(html).toContain("<input");
  });
});
