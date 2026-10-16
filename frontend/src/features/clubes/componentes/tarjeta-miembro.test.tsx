import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("@/shared/constants/avatares", () => ({
  resolverAvatar: () => "https://example.com/avatar.svg",
}));

const { TarjetaMiembro } = await import("./tarjeta-miembro");

describe("TarjetaMiembro", () => {
  it("renderiza el nombre del miembro", () => {
    const html = renderToStaticMarkup(
      <TarjetaMiembro
        posicion={1}
        nombre="Juan"
        nivel="Explorador"
        xpSemana={150}
        avatarIndex="1"
      />,
    );
    expect(html).toContain("Juan");
  });

  it("renderiza el nivel", () => {
    const html = renderToStaticMarkup(
      <TarjetaMiembro
        posicion={1}
        nombre="Juan"
        nivel="Explorador"
        xpSemana={150}
        avatarIndex="1"
      />,
    );
    expect(html).toContain("Explorador");
  });

  it("renderiza la XP semanal", () => {
    const html = renderToStaticMarkup(
      <TarjetaMiembro
        posicion={1}
        nombre="Juan"
        nivel="Explorador"
        xpSemana={150}
        avatarIndex="1"
      />,
    );
    expect(html).toContain("150 XP");
  });

  it("muestra posición 1 con color amber", () => {
    const html = renderToStaticMarkup(
      <TarjetaMiembro
        posicion={1}
        nombre="Primero"
        nivel="Explorador"
        xpSemana={100}
        avatarIndex="1"
      />,
    );
    expect(html).toContain("bg-amber-100");
  });

  it("muestra posición 2 con color slate", () => {
    const html = renderToStaticMarkup(
      <TarjetaMiembro
        posicion={2}
        nombre="Segundo"
        nivel="Explorador"
        xpSemana={90}
        avatarIndex="1"
      />,
    );
    expect(html).toContain("bg-slate-100");
  });

  it("muestra posición 3 con color orange", () => {
    const html = renderToStaticMarkup(
      <TarjetaMiembro
        posicion={3}
        nombre="Tercero"
        nivel="Explorador"
        xpSemana={80}
        avatarIndex="1"
      />,
    );
    expect(html).toContain("bg-orange-100");
  });

  it("muestra posición 4+ con color slate por defecto", () => {
    const html = renderToStaticMarkup(
      <TarjetaMiembro
        posicion={5}
        nombre="Quinto"
        nivel="Explorador"
        xpSemana={50}
        avatarIndex="1"
      />,
    );
    expect(html).toContain("bg-slate-50");
  });

  it("muestra mensaje Sin contribuciones registradas cuando no hay contribuciones", () => {
    const html = renderToStaticMarkup(
      <TarjetaMiembro
        posicion={1}
        nombre="Juan"
        nivel="Explorador"
        xpSemana={150}
        avatarIndex="1"
      />,
    );
    expect(html).toContain("Sin contribuciones registradas");
  });

  it("muestra número de actividades cuando hay contribuciones", () => {
    const html = renderToStaticMarkup(
      <TarjetaMiembro
        posicion={1}
        nombre="Juan"
        nivel="Explorador"
        xpSemana={150}
        avatarIndex="1"
        contribuciones={5}
      />,
    );
    expect(html).toContain("5 actividades");
  });

  it("renderiza el ícono Zap", () => {
    const html = renderToStaticMarkup(
      <TarjetaMiembro
        posicion={1}
        nombre="Juan"
        nivel="Explorador"
        xpSemana={150}
        avatarIndex="1"
      />,
    );
    expect(html).toContain("<svg");
  });
});
