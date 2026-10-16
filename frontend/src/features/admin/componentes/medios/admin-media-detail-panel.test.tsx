import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { AdminMediaDetailPanel } from "./admin-media-detail-panel";

const recurso = {
  id: "550e8400-e29b-41d4-a716-446655440099",
  nombre: "Ilustración de prueba",
  tipo: "imagen" as const,
  tipoLabel: "Imagen",
  imgUrl: "https://example.test/recurso.png",
  usadoEnCount: 2,
  subidoPor: "admin",
  fechaSubido: "1 ene 2026, 10:00",
  fechaTimestamp: 1704103200000,
  fechaActualizado: "2 ene 2026, 10:00",
  tamano: "42 KB",
  tamanoBytes: 43_008,
  formato: "PNG",
  tipoMime: "image/png",
  resolucion: "1200 × 800 px",
  dimensiones: "1200 × 800 px",
  anchoPx: 1200,
  altoPx: 800,
  duracionSeg: null,
  altText: "Una ilustración sobre la creación",
};

const detail = {
  id: recurso.id,
  tipo: recurso.tipo,
  bucket_almacenamiento: "media",
  clave_almacenamiento: "imagen/recurso.png",
  url_publica: recurso.imgUrl,
  texto_alternativo: recurso.altText,
  titulo: recurso.nombre,
  tipo_mime: recurso.tipoMime,
  tamano_bytes: recurso.tamanoBytes,
  ancho_px: recurso.anchoPx,
  alto_px: recurso.altoPx,
  duracion_seg: null,
  creado_por: "admin-id",
  activo: true,
  creado_en: "2026-01-01T10:00:00.000Z",
  actualizado_en: "2026-01-02T10:00:00.000Z",
  uso_total: 2,
  puede_eliminar: false,
  subido_por_usuario: {
    id: "admin-id",
    nombre_visible: "Admin Dev",
    correo: "admin@example.test",
  },
  usos: [
    {
      tipo: "tema" as const,
      entidad_id: "tema-1",
      titulo: "El Buen Pastor",
      contexto: "Portada del tema",
      tema_id: "tema-1",
      href: "/admin/temas/tema-1/detalle",
    },
    {
      tipo: "actividad" as const,
      entidad_id: "actividad-1",
      titulo: "Ordena la historia",
      contexto: "Configuración de actividad (imagenRecursoId)",
      tema_id: "tema-1",
      href: "/admin/temas/tema-1/activities",
    },
  ],
};

describe("AdminMediaDetailPanel", () => {
  it("muestra usos reales, edición, reemplazo y eliminación segura", () => {
    const html = renderToStaticMarkup(
      <AdminMediaDetailPanel
        selectedResource={recurso}
        detail={detail}
        isLoading={false}
        isBusy={false}
        onClose={() => undefined}
        onDelete={async () => undefined}
        onUpdateMetadata={async () => undefined}
        onReplace={async () => undefined}
        onGetFreshUrl={async () => recurso.imgUrl}
      />,
    );

    expect(html).toContain("Inspector de medios");
    expect(html).toContain("max-h-[240px]");
    expect(html).toContain("truncate");
    expect(html).toContain("xl:grid-rows-[auto_minmax(0,1fr)_auto]");
    expect(html).toContain("Ilustración de prueba");
    expect(html).toContain("Copiar enlace");
    expect(html).toContain("Abrir archivo");
    expect(html).toContain("Información técnica");
    expect(html).toContain("Admin Dev");
    expect(html).toContain("Uso del recurso");
    expect(html).toContain("El Buen Pastor");
    expect(html).toContain("Ordena la historia");
    expect(html).toContain("Editar datos");
    expect(html).toContain("Reemplazar");
    expect(html).toContain("No se puede eliminar · 2 usos");
    expect(html).toContain('aria-label="Cerrar inspector"');
  });
});
