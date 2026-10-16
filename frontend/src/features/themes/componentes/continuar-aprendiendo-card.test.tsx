import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ContinuarAprendiendoCard } from "./continuar-aprendiendo-card";

describe("ContinuarAprendiendoCard", () => {
  it("recomienda un tema cuando no hay progreso", () => {
    const html = renderToStaticMarkup(
      <ContinuarAprendiendoCard
        tema={{
          id: "1",
          titulo: "El amor de Dios",
          descripcion: "Tema de prueba",
          senda: "Senda del Padre",
          duracion: "20 min",
          xp: 150,
          progreso: 0,
          favorito: false,
          imagenUrl: null,
          estado: "porDefecto",
        }}
        modo="recomendado"
        onContinuar={() => undefined}
      />,
    );

    expect(html).toContain("Empieza por aquí");
    expect(html).toContain("Empezar tema");
  });
});
