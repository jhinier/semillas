import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import type { Tema } from "@/shared/api/api";
import { NuevaActividadDialogContenido, debeBuscarTemasParaNuevaActividad } from "./nueva-actividad-dialog";

describe("NuevaActividadDialog", () => {
  it("no habilita la consulta hasta que la búsqueda tenga al menos dos caracteres", () => {
    expect(debeBuscarTemasParaNuevaActividad("a")).toBe(false);
    expect(debeBuscarTemasParaNuevaActividad("ab")).toBe(true);
  });

  it("expone un diálogo accesible con cierre explícito", () => {
    const html = renderToStaticMarkup(
      <NuevaActividadDialogContenido
        busqueda=""
        temas={[]}
        isLoading={false}
        selectedThemeId=""
        onThemeChange={() => undefined}
        onClose={() => undefined}
        onContinue={() => undefined}
      />,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="nueva-actividad-titulo"');
    expect(html).toContain('aria-label="Cerrar diálogo"');
    expect(html).toContain("Escribe al menos 2 caracteres para buscar un tema.");
    expect(html).not.toContain('role="listbox"');
    expect(html).toContain("max-h-[calc(100dvh-2rem)]");
  });

  it("presenta los resultados como una lista semántica de acciones", () => {
    const html = renderToStaticMarkup(
      <NuevaActividadDialogContenido
        busqueda="no"
        temas={[{ id: "tema-1", titulo: "Noé", estado: "borrador" } as Tema]}
        isLoading={false}
        selectedThemeId=""
        onThemeChange={() => undefined}
        onClose={() => undefined}
        onContinue={() => undefined}
      />,
    );

    expect(html).toContain("<ul");
    expect(html).toContain("<li>");
    expect(html).toContain("Seleccionar Noé");
    expect(html).not.toContain('role="option"');
  });
});
