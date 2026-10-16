import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("sonner", () => ({
  toast: {
    success: () => undefined,
    error: () => undefined,
  },
}));

import type { ClubAdminResumen } from "../../admin-clubes.api";

const { AdminClubesPanelVista, enviarRetoDesdeFormulario } = await import("./admin-clubes-panel");

const clubActivo: ClubAdminResumen = {
  id: "club-semillas",
  nombre: "Club Semillas",
  descripcion: "Un club para aprender juntos.",
  activo: true,
  creado_en: "2026-07-12T00:00:00.000Z",
  miembros: 8,
  retos_abiertos: 2,
  lider: { usuario_id: "lider-1", apodo: "Luz" },
};

describe("AdminClubesPanelVista", () => {
  it("muestra clubes, filtros y la acción de archivar", () => {
    const html = renderToStaticMarkup(
      <AdminClubesPanelVista
        estado={{ clubes: [clubActivo], total: 1, isLoading: false, seleccionId: clubActivo.id }}
      />,
    );

    expect(html).toContain('aria-label="Buscar clubes"');
    expect(html).toContain("Club Semillas");
    expect(html).toContain('aria-label="Archivar Club Semillas"');
  });

  it("deshabilita las mutaciones y muestra el aviso al no haber conexión", () => {
    const html = renderToStaticMarkup(
      <AdminClubesPanelVista
        estado={{ clubes: [clubActivo], total: 1, isLoading: false, online: false }}
      />,
    );

    expect(html).toContain('aria-label="Archivar Club Semillas"');
    expect(html).toContain("disabled");
    expect(html).toContain("La administración de clubes requiere conexión a internet.");
  });

  it("muestra estados de carga, vacío, error y confirmación", () => {
    const carga = renderToStaticMarkup(
      <AdminClubesPanelVista estado={{ clubes: [], total: 0, isLoading: true }} />,
    );
    const vacio = renderToStaticMarkup(
      <AdminClubesPanelVista estado={{ clubes: [], total: 0, isLoading: false }} />,
    );
    const error = renderToStaticMarkup(
      <AdminClubesPanelVista estado={{ clubes: [], total: 0, isLoading: false, error: "Error de red" }} />,
    );
    const confirmacion = renderToStaticMarkup(
      <AdminClubesPanelVista
        estado={{
          clubes: [clubActivo],
          total: 1,
          isLoading: false,
          confirmacion: { tipo: "archivar", club: clubActivo },
        }}
      />,
    );

    expect(carga).toContain("Cargando clubes");
    expect(vacio).toContain("No hay clubes para estos filtros.");
    expect(error).toContain("Error de red");
    expect(confirmacion).toContain("¿Archivar Club Semillas?");
  });

  it("muestra un error y no crea el reto cuando falta la fecha final", () => {
    const retosCreados: unknown[] = [];

    const error = enviarRetoDesdeFormulario({
      clubId: clubActivo.id,
      nombre: "Reto semanal",
      objetivo: "10",
      fechaFin: "",
      onCrear: (...argumentos) => retosCreados.push(argumentos),
    });

    expect(error).toBe("Ingresa una fecha de finalización válida.");
    expect(retosCreados).toEqual([]);
  });

  it("no crea el reto cuando la fecha final es inválida", () => {
    const retosCreados: unknown[] = [];

    const error = enviarRetoDesdeFormulario({
      clubId: clubActivo.id,
      nombre: "Reto semanal",
      objetivo: "10",
      fechaFin: "fecha-invalida",
      onCrear: (...argumentos) => retosCreados.push(argumentos),
    });

    expect(error).toBe("Ingresa una fecha de finalización válida.");
    expect(retosCreados).toEqual([]);
  });
});
