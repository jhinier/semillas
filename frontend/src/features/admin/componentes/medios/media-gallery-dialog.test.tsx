import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { MediaGalleryDialog } from "./media-gallery-dialog";

const recurso = {
  id: "recurso-1",
  tipo: "imagen" as const,
  bucket_almacenamiento: "media",
  clave_almacenamiento: "imagen/recurso.png",
  url_publica: "https://example.test/recurso.png",
  texto_alternativo: "Ilustración",
  titulo: "Ilustración de prueba con un nombre suficientemente largo",
  tipo_mime: "image/png",
  tamano_bytes: 1024,
  ancho_px: 800,
  alto_px: 600,
  duracion_seg: null,
  creado_por: "admin",
  activo: true,
  creado_en: "2026-01-01T00:00:00.000Z",
  actualizado_en: "2026-01-01T00:00:00.000Z",
};

describe("MediaGalleryDialog", () => {
  it("presenta una biblioteca profesional con selección diferida y panel de detalles", () => {
    const html = renderToStaticMarkup(
      <MediaGalleryDialog
        open
        title="Recurso visual"
        acceptedTypes={["imagen", "video"]}
        resources={[recurso]}
        selectedResourceId="recurso-1"
        onClose={() => undefined}
        onRemove={() => undefined}
        onSelect={() => undefined}
        onUpload={() => undefined}
      />,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain("Buscar por nombre, descripción o formato");
    expect(html).toContain("Todos");
    expect(html).toContain("Imágenes");
    expect(html).toContain("Videos");
    expect(html).toContain("Detalles");
    expect(html).toContain("Subir nuevo");
    expect(html).toContain("Recurso seleccionado");
    expect(html).toContain("Usar recurso");
    expect(html).toContain("Quitar recurso actual");
    expect(html).toContain(`title="${recurso.titulo}"`);
    expect(html).not.toContain("Ver vista previa de");
  });

  it("no renderiza contenido cuando está cerrado", () => {
    const html = renderToStaticMarkup(
      <MediaGalleryDialog
        open={false}
        title="Recurso visual"
        acceptedTypes={["imagen"]}
        resources={[]}
        selectedResourceId={null}
        onClose={() => undefined}
        onRemove={() => undefined}
        onSelect={() => undefined}
        onUpload={() => undefined}
      />,
    );

    expect(html).toBe("");
  });
});
