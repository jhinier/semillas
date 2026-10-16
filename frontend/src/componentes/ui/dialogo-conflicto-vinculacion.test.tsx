import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DialogoContenido } from "./dialogo-conflicto-vinculacion";

describe("DialogoConflictoVinculacion", () => {
  it("expone role dialog accesible y el mensaje del backend", () => {
    const html = renderToStaticMarkup(
      <DialogoContenido
        mensaje="El correo an***@gmail.com ya pertenece a otra cuenta de Semillas"
        onContinuarInvitado={() => undefined}
        onCambiarCuenta={() => undefined}
      />,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="conflicto-titulo"');
    expect(html).toContain("Esta cuenta ya esta vinculada");
    expect(html).toContain("an***@gmail.com");
  });

  it("ofrece las dos acciones y no expone cierre por backdrop", () => {
    const html = renderToStaticMarkup(
      <DialogoContenido
        mensaje="x"
        onContinuarInvitado={() => undefined}
        onCambiarCuenta={() => undefined}
      />,
    );

    expect(html).toContain("Seguir como invitado");
    expect(html).toContain("Iniciar sesion con otra cuenta");
  });

  it("aplica z-index superior al shell y overlay opaco", () => {
    const html = renderToStaticMarkup(
      <DialogoContenido
        mensaje="x"
        onContinuarInvitado={() => undefined}
        onCambiarCuenta={() => undefined}
      />,
    );

    expect(html).toContain("z-[1000]");
    expect(html).toContain("bg-black/90");
  });
});
