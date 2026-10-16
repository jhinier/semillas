import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { AvatarTexto } from "./avatar-texto";
import { BadgeEstado } from "./badge-estado";
import { FilaTabla, TablaBase } from "./tabla-base";

describe("tabla-base", () => {
  it("renderiza encabezados y estado vacío", () => {
    const html = renderToStaticMarkup(
      <TablaBase
        encabezados={[{ contenido: "Tema" }, { contenido: "Estado" }]}
        estadoVacio="No hay temas"
      >
        {null}
      </TablaBase>,
    );

    expect(html).toContain("Tema");
    expect(html).toContain("Estado");
    expect(html).toContain("No hay temas");
    expect(html).toContain('colSpan="2"');
  });

  it("expone el click de fila cuando es interactiva", () => {
    const handleClick = mock(() => undefined);

    const fila = FilaTabla({
      onActivate: handleClick,
      children: <td>Fila</td>,
    });

    expect(fila.type).toBe("tr");
    expect(fila.props.tabIndex).toBe(0);
    expect(String(fila.props.className)).toContain("cursor-pointer");
  });

  it("no activa la fila cuando el click viene de un control interno", () => {
    const handleClick = mock(() => undefined);
    const fila = FilaTabla({
      onActivate: handleClick,
      children: (
        <td>
          <button type="button">Editar</button>
        </td>
      ),
    });

    fila.props.onClick?.({
      target: {
        closest: () => true,
      },
    } as any);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renderiza el badge de estado con texto normalizado", () => {
    const html = renderToStaticMarkup(<BadgeEstado estado="en revisión" />);

    expect(html).toContain("En revisión");
    expect(html).toContain("bg-[#6C3AED]/10");
  });

  it("renderiza avatar y texto con jerarquía compacta", () => {
    const html = renderToStaticMarkup(
      <AvatarTexto
        src="https://ejemplo.com/avatar.png"
        alt="María López"
        titulo="María López"
        subtitulo="Nivel 4"
      />,
    );

    expect(html).toContain('src="https://ejemplo.com/avatar.png"');
    expect(html).toContain("María López");
    expect(html).toContain("Nivel 4");
  });
});
