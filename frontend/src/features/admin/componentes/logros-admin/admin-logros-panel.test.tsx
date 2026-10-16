import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("../../hooks/use-admin-logros", () => ({
  useAdminLogros: () => ({
    estaConectado: true,
    listado: {
      data: {
        logros: [
          {
            id: "l1",
            codigo: "primer-tema",
            nombre: "Primer tema",
            descripcion: "Completaste tu primer tema",
            url_icono: null,
            bono_xp: 30,
            codigo_criterio: "temas_completados",
            valor_criterio: 1,
            activo: true,
            creado_en: "2026-07-13T00:00:00.000Z",
            otorgados: 2,
          },
        ],
        meta: { total: 1, limit: 20, offset: 0 },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: async () => undefined,
    },
    crear: { isPending: false, mutateAsync: async () => undefined },
    actualizar: { isPending: false, mutateAsync: async () => undefined },
    archivar: { isPending: false, mutateAsync: async () => undefined },
    reactivar: { isPending: false, mutateAsync: async () => undefined },
    mutando: false,
  }),
}));

const { AdminLogrosPanel } = await import("./admin-logros-panel");

describe("AdminLogrosPanel", () => {
  it("muestra el encabezado y la acción de crear logro", () => {
    const html = renderToStaticMarkup(<AdminLogrosPanel />);

    expect(html).toContain("Logros");
    expect(html).toContain("Nuevo logro");
    expect(html).toContain("Primer tema");
  });
});
