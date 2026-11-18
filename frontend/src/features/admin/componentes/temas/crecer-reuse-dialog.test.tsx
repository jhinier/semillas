import { describe, expect, it } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { CrecerReuseDialog } from "./crecer-reuse-dialog";

describe("CrecerReuseDialog", () => {
  it("muestra pestañas del mismo tema y otros temas junto con la copia por franja", () => {
    const client = new QueryClient();
    const html = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <CrecerReuseDialog
          open
          themeId="t1"
          themeTitle="David y Goliat"
          ageGroups={[
            { id: "g-sem", nombre: "Semillas" },
            { id: "g-exp", nombre: "Exploradores" },
          ]}
          targetAgeGroup={{ id: "g-sem", nombre: "Semillas" }}
          targetStepCode="conectar"
          targetStepName="Conectar"
          currentStepsData={[
            {
              orden: 1,
              tipo_paso: { codigo: "conectar", nombre: "Conectar" },
              contenidos: [
                {
                  grupo_edad_id: "g-exp",
                  titulo: "¿Tienes miedo a veces?",
                  cuerpo: "Historia introductoria para Exploradores.",
                },
              ],
            },
          ]}
          isCopyingAgeGroup={false}
          hasExistingContentInTarget={false}
          onClose={() => undefined}
          onLoadMoment={() => undefined}
          onCopyFullAgeGroup={async () => undefined}
        />
      </QueryClientProvider>,
    );

    expect(html).toContain("Traer contenido para Semillas");
    expect(html).toContain("Este mismo tema");
    expect(html).toContain("Otros temas");
    expect(html).toContain("Copiar franja completa hacia Semillas");
    expect(html).toContain("Exploradores · 1/6 momentos listos");
    expect(html).toContain("¿Tienes miedo a veces?");
  });
});
