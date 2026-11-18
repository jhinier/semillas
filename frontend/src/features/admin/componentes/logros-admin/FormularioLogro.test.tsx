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

  it("en presentación página muestra la vista previa en vivo sin errores prematuros ni botón de cierre de modal", () => {
    const html = renderToStaticMarkup(
      <FormularioLogro
        abierto
        modo="crear"
        presentacion="pagina"
        guardando={false}
        onCerrar={() => undefined}
        onGuardar={() => undefined}
      />,
    );

    expect(html).toContain("Así lo verá el estudiante");
    expect(html).toContain("Nombre y mensaje para el niño");
    expect(html).toContain("¿Cómo se gana este logro?");
    expect(html).toContain("Elige o sube la imagen de la medalla");
    expect(html).toContain("Subir imagen");
    expect(html).toContain("Elegir de biblioteca");
    expect(html).toContain('accept="image/jpeg,image/png,image/webp"');
    expect(html).not.toContain('aria-label="Cerrar"');
    expect(html).not.toContain('role="alert"');
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain("El código debe tener al menos 3 caracteres.");
  });

  it("muestra una alerta visible junto al botón de guardado cuando ocurre un error del servidor", () => {
    const html = renderToStaticMarkup(
      <FormularioLogro
        abierto
        modo="crear"
        presentacion="pagina"
        guardando={false}
        errorEnvio="Ya existe un logro con ese código"
        onCerrar={() => undefined}
        onGuardar={() => undefined}
      />,
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain("Ya existe un logro con ese código");
  });

  it("en presentación modal incluye la vista previa en vivo y resuelve rutas /media sin exponer JSON crudo en img", () => {
    const html = renderToStaticMarkup(
      <FormularioLogro
        abierto
        modo="editar"
        logro={{
          id: "l2",
          codigo: "insignia-5",
          nombre: "Insignia 5",
          descripcion: "Quinta insignia de logro",
          url_icono: "https://api.example.com/media/123e4567-e89b-12d3-a456-426614174000/url",
          bono_xp: 200,
          codigo_criterio: "actividades_completadas",
          valor_criterio: 25,
          activo: true,
          creado_en: "2026-07-09T23:52:47.414+00:00",
          otorgados: 0,
        }}
        guardando={false}
        onCerrar={() => undefined}
        onGuardar={() => undefined}
      />,
    );

    expect(html).toContain("admin-logros-modal-card--wide");
    expect(html).toContain("admin-logros-close-btn");
    expect(html).toContain("Así lo verá el estudiante");
    expect(html).not.toContain("/media/123e4567-e89b-12d3-a456-426614174000/url");
  });
});
