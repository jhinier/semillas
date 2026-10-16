import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { CoverImageUpload } from "./cover-image-upload";

const recurso = {
  id: "recurso-portada-1",
  tipo: "imagen" as const,
  bucket_almacenamiento: "media",
  clave_almacenamiento: "portadas/genesis.webp",
  url_publica: "https://example.test/portada.webp",
  texto_alternativo: "Portada ilustrada",
  titulo: "Portada de Génesis",
  tipo_mime: "image/webp",
  tamano_bytes: 2048,
  ancho_px: 1600,
  alto_px: 900,
  duracion_seg: null,
  creado_por: "admin",
  activo: true,
  creado_en: "2026-01-01T00:00:00.000Z",
  actualizado_en: "2026-01-01T00:00:00.000Z",
};

describe("CoverImageUpload", () => {
  it("muestra una tarjeta estática cuando no se conecta a la biblioteca", () => {
    const html = renderToStaticMarkup(<CoverImageUpload />);

    expect(html).toContain("Portada del tema");
    expect(html).toContain("Arrastra y suelta una imagen aqui");
    expect(html).toContain("Consejo");
    expect(html).not.toContain("Elegir portada");
  });

  it("reutiliza la biblioteca multimedia para elegir o subir portadas", () => {
    const html = renderToStaticMarkup(
      <CoverImageUpload
        themeTitle="Génesis"
        cover={recurso}
        resources={[recurso]}
        open
        onOpenChange={() => undefined}
        onSelect={() => undefined}
        onRemove={() => undefined}
        onUpload={() => Promise.resolve(recurso)}
      />,
    );

    expect(html).toContain("Cambiar portada");
    expect(html).toContain("Quitar portada");
    expect(html).toContain("Portada de Génesis");
    expect(html).toContain("Usar recurso");
    expect(html).toContain("Subir nuevo");
  });
});
