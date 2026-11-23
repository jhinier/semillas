import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { CrecerMatrixStatus } from "./crecer-matrix-status";

describe("CrecerMatrixStatus", () => {
  it("muestra las tres franjas, los seis momentos y estados accionables", () => {
    const html = renderToStaticMarkup(
      <CrecerMatrixStatus
        ageGroups={[
          { id: "semillas", nombre: "Semillas" },
          { id: "exploradores", nombre: "Exploradores" },
          { id: "embajadores", nombre: "Embajadores" },
        ]}
        steps={[
          { codigo: "conectar", nombre: "Conectar" },
          { codigo: "relatar", nombre: "Relatar" },
          { codigo: "ensenar", nombre: "Enseñar" },
          { codigo: "comprobar", nombre: "Comprobar" },
          { codigo: "experimentar", nombre: "Experimentar" },
          { codigo: "recompensar", nombre: "Recompensar" },
        ]}
        getCell={(ageGroupId, stepCode) =>
          ageGroupId === "semillas" && stepCode === "conectar" ? "complete" :
          ageGroupId === "exploradores" && stepCode === "relatar" ? "draft" :
          ageGroupId === "embajadores" && stepCode === "ensenar" ? { ageGroupId, stepCode, status: "error", message: "Falta revisar" } :
          "missing"}
        onSelect={() => undefined}
      />,
    );

    expect(html).toContain("Semillas");
    expect(html).toContain("Exploradores");
    expect(html).toContain("Embajadores");
    expect(html).toContain("Conectar");
    expect(html).toContain("Recompensar");
    expect(html).toContain("Completo");
    expect(html).toContain("Borrador");
    expect(html).toContain("Revisar");
    expect(html).toContain("Pendiente");
    expect(html).toContain("Mapa de avance (18 momentos)");
    expect(html).toContain("aria-label=\"Semillas, Conectar: Completo\"");
  });

  it("muestra solo las franjas seleccionadas y ajusta el conteo de momentos (6 momentos para 1 franja)", () => {
    const html = renderToStaticMarkup(
      <CrecerMatrixStatus
        ageGroups={[{ id: "exploradores", nombre: "Exploradores" }]}
        steps={[
          { codigo: "conectar", nombre: "Conectar" },
          { codigo: "relatar", nombre: "Relatar" },
          { codigo: "ensenar", nombre: "Enseñar" },
          { codigo: "comprobar", nombre: "Comprobar" },
          { codigo: "experimentar", nombre: "Experimentar" },
          { codigo: "recompensar", nombre: "Recompensar" },
        ]}
        getCell={() => "missing"}
        onSelect={() => undefined}
      />,
    );

    expect(html).toContain("Mapa de avance (6 momentos)");
    expect(html).toContain("Exploradores");
    expect(html).not.toContain("Semillas");
    expect(html).not.toContain("Embajadores");
  });
});
