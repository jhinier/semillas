import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("sonner", () => ({
  toast: {
    success: () => undefined,
    error: () => undefined,
  },
}));

import type { ClubAdminResumen } from "../../admin-clubes.api";
import { TarjetaClub } from "./TarjetaClub";

const clubConLider: ClubAdminResumen = {
  id: "club-1",
  nombre: "Club Semillas",
  descripcion: "Club de estudio bíblico",
  activo: true,
  creado_en: "2026-07-12T00:00:00.000Z",
  miembros: 12,
  retos_abiertos: 3,
  lider: { usuario_id: "lider-1", apodo: "Luz" },
};

const clubSinLider: ClubAdminResumen = {
  id: "club-2",
  nombre: "Club Amigos",
  descripcion: null,
  activo: false,
  creado_en: "2026-07-12T00:00:00.000Z",
  miembros: 5,
  retos_abiertos: 0,
  lider: null,
};

describe("TarjetaClub", () => {
  it("renderiza el nombre del club", () => {
    const html = renderToStaticMarkup(
      <TarjetaClub
        club={clubConLider}
        seleccionado={false}
        deshabilitado={false}
      />,
    );

    expect(html).toContain("Club Semillas");
  });

  it("muestra apodo del líder y cantidad de miembros", () => {
    const html = renderToStaticMarkup(
      <TarjetaClub
        club={clubConLider}
        seleccionado={false}
        deshabilitado={false}
      />,
    );

    expect(html).toContain("Luz");
    expect(html).toContain("12 miembros");
  });

  it("muestra 'Sin líder' cuando no hay líder", () => {
    const html = renderToStaticMarkup(
      <TarjetaClub
        club={clubSinLider}
        seleccionado={false}
        deshabilitado={false}
      />,
    );

    expect(html).toContain("Sin líder");
    expect(html).toContain("5 miembros");
  });

  it("aplica clase de seleccionado cuando está seleccionado", () => {
    const html = renderToStaticMarkup(
      <TarjetaClub
        club={clubConLider}
        seleccionado={true}
        deshabilitado={false}
      />,
    );

    expect(html).toContain("border-emerald-500");
    expect(html).toContain("bg-emerald-50");
  });

  it("aplica clase de no seleccionado cuando no está seleccionado", () => {
    const html = renderToStaticMarkup(
      <TarjetaClub
        club={clubConLider}
        seleccionado={false}
        deshabilitado={false}
      />,
    );

    expect(html).toContain("border-slate-200");
    expect(html).toContain("bg-white");
  });

  it("renderiza estructura de artículo con nombre del club", () => {
    const html = renderToStaticMarkup(
      <TarjetaClub
        club={clubConLider}
        seleccionado={false}
        deshabilitado={false}
      />,
    );

    expect(html).toContain("Club Semillas");
    expect(html).toContain("Luz");
    expect(html).toContain("12 miembros");
  });

  it("renderiza botón con aria-label para accciones", () => {
    const html = renderToStaticMarkup(
      <TarjetaClub
        club={clubConLider}
        seleccionado={false}
        deshabilitado={false}
        onAccion={() => {}}
      />,
    );

    expect(html).toContain("border-slate-200");
  });

  it("renderiza sin_onSeleccionar (opcional)", () => {
    const html = renderToStaticMarkup(
      <TarjetaClub
        club={clubConLider}
        seleccionado={false}
        deshabilitado={false}
      />,
    );

    expect(html).toContain("Club Semillas");
  });

  it("renderiza sin onAccion (opcional)", () => {
    const html = renderToStaticMarkup(
      <TarjetaClub
        club={clubConLider}
        seleccionado={false}
        deshabilitado={false}
      />,
    );

    expect(html).toContain("Club Semillas");
  });
});
