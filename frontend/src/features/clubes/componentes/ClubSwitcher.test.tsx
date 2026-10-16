import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

const { ClubSwitcher } = await import("./ClubSwitcher");

describe("ClubSwitcher", () => {
  it("renderiza lista de clubes", () => {
    const clubs = [
      { id: "1", nombre: "Club A", descripcion: null, codigo_invitacion: "AAA", creado_por: "u1", activo: true, creado_en: "2026-01-01", member_count: 5 },
      { id: "2", nombre: "Club B", descripcion: null, codigo_invitacion: "BBB", creado_por: "u1", activo: true, creado_en: "2026-01-01", member_count: 3 },
    ];
    const html = renderToStaticMarkup(
      <ClubSwitcher clubs={clubs} activeId="1" onSelect={() => {}} onAdd={() => {}} />,
    );
    expect(html).toContain("Club A");
    expect(html).toContain("Club B");
  });

  it("muestra member_count para cada club", () => {
    const clubs = [
      { id: "1", nombre: "Club A", descripcion: null, codigo_invitacion: "AAA", creado_por: "u1", activo: true, creado_en: "2026-01-01", member_count: 5 },
    ];
    const html = renderToStaticMarkup(
      <ClubSwitcher clubs={clubs} activeId="1" onSelect={() => {}} onAdd={() => {}} />,
    );
    expect(html).toContain("5");
  });

  it("muestra 0 cuando member_count es undefined", () => {
    const clubs = [
      { id: "1", nombre: "Club A", descripcion: null, codigo_invitacion: "AAA", creado_por: "u1", activo: true, creado_en: "2026-01-01" },
    ];
    const html = renderToStaticMarkup(
      <ClubSwitcher clubs={clubs} activeId="1" onSelect={() => {}} onAdd={() => {}} />,
    );
    expect(html).toContain("0");
  });

  it("marca club activo con data-active", () => {
    const clubs = [
      { id: "1", nombre: "Club A", descripcion: null, codigo_invitacion: "AAA", creado_por: "u1", activo: true, creado_en: "2026-01-01", member_count: 5 },
    ];
    const html = renderToStaticMarkup(
      <ClubSwitcher clubs={clubs} activeId="1" onSelect={() => {}} onAdd={() => {}} />,
    );
    expect(html).toContain('data-active="true"');
  });

  it("renderiza botón para agregar club", () => {
    const html = renderToStaticMarkup(
      <ClubSwitcher clubs={[]} activeId="" onSelect={() => {}} onAdd={() => {}} />,
    );
    expect(html).toContain("Agregar club");
  });

  it("aplica clase club-switcher", () => {
    const html = renderToStaticMarkup(
      <ClubSwitcher clubs={[]} activeId="" onSelect={() => {}} onAdd={() => {}} />,
    );
    expect(html).toContain("club-switcher");
  });

  it("renderiza icono Users para cada club", () => {
    const clubs = [
      { id: "1", nombre: "Club A", descripcion: null, codigo_invitacion: "AAA", creado_por: "u1", activo: true, creado_en: "2026-01-01", member_count: 5 },
    ];
    const html = renderToStaticMarkup(
      <ClubSwitcher clubs={clubs} activeId="1" onSelect={() => {}} onAdd={() => {}} />,
    );
    expect(html).toContain("<svg");
  });

  it("maneja array vacío de clubes", () => {
    const html = renderToStaticMarkup(
      <ClubSwitcher clubs={[]} activeId="" onSelect={() => {}} onAdd={() => {}} />,
    );
    expect(html).toContain("Agregar club");
  });

  it("renderiza botón para agregar con ícono Plus", () => {
    const html = renderToStaticMarkup(
      <ClubSwitcher clubs={[]} activeId="" onSelect={() => {}} onAdd={() => {}} />,
    );
    expect(html).toContain("club-switcher__add");
  });
});
