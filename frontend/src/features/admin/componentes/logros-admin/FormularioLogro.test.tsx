import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { FormularioLogro } from "./FormularioLogro";

describe("FormularioLogro", () => {
  it("renderiza el formulario de creación", () => {
    const html = renderToStaticMarkup(
      <FormularioLogro abierto modo="crear" guardando={false} onCerrar={() => undefined} onGuardar={() => undefined} />,
    );

    expect(html).toContain("Nuevo logro");
    expect(html).toContain('placeholder="primer-tema"');
    expect(html).toContain("Criterio de desbloqueo");
  });

  it("renderiza el encabezado de edición cuando se edita un logro existente", () => {
    const html = renderToStaticMarkup(
      <FormularioLogro
        abierto
        modo="editar"
        logro={{
          id: "l1",
          codigo: "racha-3",
          nombre: "Tres días",
          descripcion: "Tres días seguidos",
          url_icono: "https://cdn.example.com/x.png",
          bono_xp: 50,
          codigo_criterio: "dias_racha",
          valor_criterio: 3,
          activo: true,
          creado_en: "2026-07-13T00:00:00.000Z",
          otorgados: 0,
        }}
        guardando={false}
        onCerrar={() => undefined}
        onGuardar={() => undefined}
      />,
    );

    expect(html).toContain("Editar Tres días");
    expect(html).toContain("Código");
    expect(html).toContain("Guardar cambios");
  });
});
