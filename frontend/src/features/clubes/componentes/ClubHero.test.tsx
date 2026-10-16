import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

const { ClubHero } = await import("./ClubHero");

describe("ClubHero", () => {
  it("renderiza el nombre del club", () => {
    const club = {
      id: "1",
      nombre: "Mi Club",
      descripcion: "Descripción del club",
      codigo_invitacion: "ABC123",
      creado_por: "user-1",
      activo: true,
      creado_en: "2026-01-15",
    };
    const html = renderToStaticMarkup(
      <ClubHero club={club} members={10} role="miembro" copied={false} onCopy={() => {}} onShare={() => {}} />,
    );
    expect(html).toContain("Mi Club");
  });

  it("muestra descripción del club cuando existe", () => {
    const club = {
      id: "1",
      nombre: "Mi Club",
      descripcion: "Descripción del club",
      codigo_invitacion: "ABC123",
      creado_por: "user-1",
      activo: true,
      creado_en: "2026-01-15",
    };
    const html = renderToStaticMarkup(
      <ClubHero club={club} members={10} role="miembro" copied={false} onCopy={() => {}} onShare={() => {}} />,
    );
    expect(html).toContain("Descripción del club");
  });

  it("muestra descripción por defecto cuando no hay descripción", () => {
    const club = {
      id: "1",
      nombre: "Mi Club",
      descripcion: null,
      codigo_invitacion: "ABC123",
      creado_por: "user-1",
      activo: true,
      creado_en: "2026-01-15",
    };
    const html = renderToStaticMarkup(
      <ClubHero club={club} members={10} role="miembro" copied={false} onCopy={() => {}} onShare={() => {}} />,
    );
    expect(html).toContain("Un espacio para aprender, avanzar y celebrar juntos.");
  });

  it("muestra el código de invitación", () => {
    const club = {
      id: "1",
      nombre: "Mi Club",
      descripcion: "Descripción",
      codigo_invitacion: "XYZ789",
      creado_por: "user-1",
      activo: true,
      creado_en: "2026-01-15",
    };
    const html = renderToStaticMarkup(
      <ClubHero club={club} members={10} role="miembro" copied={false} onCopy={() => {}} onShare={() => {}} />,
    );
    expect(html).toContain("XYZ789");
  });

  it("muestra el número de miembros", () => {
    const club = {
      id: "1",
      nombre: "Mi Club",
      descripcion: "Descripción",
      codigo_invitacion: "ABC123",
      creado_por: "user-1",
      activo: true,
      creado_en: "2026-01-15",
    };
    const html = renderToStaticMarkup(
      <ClubHero club={club} members={25} role="miembro" copied={false} onCopy={() => {}} onShare={() => {}} />,
    );
    expect(html).toContain("25");
    expect(html).toContain("miembros");
  });

  it("muestra etiqueta Líder para rol lider", () => {
    const club = {
      id: "1",
      nombre: "Mi Club",
      descripcion: "Descripción",
      codigo_invitacion: "ABC123",
      creado_por: "user-1",
      activo: true,
      creado_en: "2026-01-15",
    };
    const html = renderToStaticMarkup(
      <ClubHero club={club} members={10} role="lider" copied={false} onCopy={() => {}} onShare={() => {}} />,
    );
    expect(html).toContain("Líder");
  });

  it("muestra etiqueta Líder para rol propietario", () => {
    const club = {
      id: "1",
      nombre: "Mi Club",
      descripcion: "Descripción",
      codigo_invitacion: "ABC123",
      creado_por: "user-1",
      activo: true,
      creado_en: "2026-01-15",
    };
    const html = renderToStaticMarkup(
      <ClubHero club={club} members={10} role="propietario" copied={false} onCopy={() => {}} onShare={() => {}} />,
    );
    expect(html).toContain("Líder");
  });

  it("muestra etiqueta Miembro para otros roles", () => {
    const club = {
      id: "1",
      nombre: "Mi Club",
      descripcion: "Descripción",
      codigo_invitacion: "ABC123",
      creado_por: "user-1",
      activo: true,
      creado_en: "2026-01-15",
    };
    const html = renderToStaticMarkup(
      <ClubHero club={club} members={10} role="miembro" copied={false} onCopy={() => {}} onShare={() => {}} />,
    );
    expect(html).toContain("Miembro");
  });

  it("muestra Copiar cuando copiado es false", () => {
    const club = {
      id: "1",
      nombre: "Mi Club",
      descripcion: "Descripción",
      codigo_invitacion: "ABC123",
      creado_por: "user-1",
      activo: true,
      creado_en: "2026-01-15",
    };
    const html = renderToStaticMarkup(
      <ClubHero club={club} members={10} role="miembro" copied={false} onCopy={() => {}} onShare={() => {}} />,
    );
    expect(html).toContain("Copiar");
    expect(html).not.toContain("Copiado");
  });

  it("muestra Copiado cuando copiado es true", () => {
    const club = {
      id: "1",
      nombre: "Mi Club",
      descripcion: "Descripción",
      codigo_invitacion: "ABC123",
      creado_por: "user-1",
      activo: true,
      creado_en: "2026-01-15",
    };
    const html = renderToStaticMarkup(
      <ClubHero club={club} members={10} role="miembro" copied={true} onCopy={() => {}} onShare={() => {}} />,
    );
    expect(html).toContain("Copiado");
  });

  it("aplica clase club-hero", () => {
    const club = {
      id: "1",
      nombre: "Mi Club",
      descripcion: "Descripción",
      codigo_invitacion: "ABC123",
      creado_por: "user-1",
      activo: true,
      creado_en: "2026-01-15",
    };
    const html = renderToStaticMarkup(
      <ClubHero club={club} members={10} role="miembro" copied={false} onCopy={() => {}} onShare={() => {}} />,
    );
    expect(html).toContain("club-hero");
  });

  it("muestra fecha de creación formateada", () => {
    const club = {
      id: "1",
      nombre: "Mi Club",
      descripcion: "Descripción",
      codigo_invitacion: "ABC123",
      creado_por: "user-1",
      activo: true,
      creado_en: "2026-07-15",
    };
    const html = renderToStaticMarkup(
      <ClubHero club={club} members={10} role="miembro" copied={false} onCopy={() => {}} onShare={() => {}} />,
    );
    expect(html).toContain("jul 2026");
    expect(html).toContain("Desde");
  });
});
