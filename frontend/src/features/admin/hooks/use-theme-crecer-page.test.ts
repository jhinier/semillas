import { describe, expect, it } from "bun:test";

import {
  actualizarBorradoresCrecer,
  crearClaveBorradorCrecer,
  sonBorradoresCrecerIguales,
  subirImagenMarkdown,
  type CrecerDraft,
} from "./use-theme-crecer-page";

const archivo = new File(["imagen"], "leccion.png", { type: "image/png" });

describe("subirImagenMarkdown", () => {
  it("sube la imagen y retorna la URL firmada para insertarla en Markdown", async () => {
    const llamadas: string[] = [];

    const url = await subirImagenMarkdown(
      archivo,
      async (recibido, tipo) => {
        llamadas.push(`${recibido.name}:${tipo}`);
        return { id: "recurso-1" };
      },
      async (id) => {
        llamadas.push(id);
        return { url: "https://firmada.example/leccion.png" };
      },
    );

    expect(url).toBe("https://firmada.example/leccion.png");
    expect(llamadas).toEqual(["leccion.png:imagen", "recurso-1"]);
  });

  it("propaga el error de subida sin producir una URL para modificar el cuerpo", async () => {
    await expect(
      subirImagenMarkdown(
        archivo,
        async () => {
          throw new Error("Archivo rechazado");
        },
        async () => ({ url: "https://firmada.example/no-debe-usarse.png" }),
      ),
    ).rejects.toThrow("Archivo rechazado");
  });
});

const borradorBase: CrecerDraft = {
  title: "Conectar",
  body: "Contenido del paso",
  shortInstruction: "Escucha y piensa",
  resourceId: null,
  audioResourceId: null,
  questions: [{ pregunta: "¿Qué aprendiste?", orden: 1 }],
};

describe("borradores del Editor CRECER", () => {
  it("usa una clave independiente por franja y momento", () => {
    expect(crearClaveBorradorCrecer("semillas", "conectar")).toBe("semillas::conectar");
    expect(crearClaveBorradorCrecer("exploradores", "conectar")).not.toBe(
      crearClaveBorradorCrecer("semillas", "conectar"),
    );
  });

  it("conserva varios borradores sin mezclar sus contenidos", () => {
    const servidor = { ...borradorBase, title: "" };
    const primerKey = crearClaveBorradorCrecer("semillas", "conectar");
    const segundoKey = crearClaveBorradorCrecer("exploradores", "relatar");

    const conPrimero = actualizarBorradoresCrecer({}, primerKey, borradorBase, servidor);
    const conAmbos = actualizarBorradoresCrecer(
      conPrimero,
      segundoKey,
      { ...borradorBase, title: "Relatar" },
      servidor,
    );

    expect(conAmbos[primerKey]?.title).toBe("Conectar");
    expect(conAmbos[segundoKey]?.title).toBe("Relatar");
  });

  it("elimina el borrador local cuando vuelve a coincidir con el servidor", () => {
    const key = crearClaveBorradorCrecer("semillas", "conectar");
    const drafts = actualizarBorradoresCrecer({}, key, borradorBase, { ...borradorBase, title: "" });
    const reconciliados = actualizarBorradoresCrecer(drafts, key, borradorBase, borradorBase);

    expect(reconciliados[key]).toBeUndefined();
  });

  it("compara también medios y preguntas", () => {
    expect(sonBorradoresCrecerIguales(borradorBase, { ...borradorBase })).toBe(true);
    expect(
      sonBorradoresCrecerIguales(borradorBase, {
        ...borradorBase,
        questions: [{ pregunta: "Otra pregunta", orden: 1 }],
      }),
    ).toBe(false);
  });
});
