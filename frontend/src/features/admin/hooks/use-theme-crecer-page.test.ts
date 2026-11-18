import { describe, expect, it } from "bun:test";

import {
  actualizarBorradoresCrecer,
  crearClaveBorradorCrecer,
  extraerMomentosReutilizables,
  planificarCopiaFranjaCrecer,
  sonBorradoresCrecerIguales,
  subirImagenMarkdown,
  type CrecerDraft,
  type StepRecord,
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

describe("reutilización de momentos CRECER", () => {
  const ageGroups = [
    { id: "g-sem", nombre: "Semillas" },
    { id: "g-exp", nombre: "Exploradores" },
  ];
  const pasosCatalog = [
    { id: "tipo-conectar", codigo: "conectar", nombre: "Conectar" },
    { id: "tipo-exp", codigo: "experimentar", nombre: "Experimentar" },
  ];
  const sourceSteps: StepRecord[] = [
    {
      orden: 1,
      tipo_paso: { codigo: "conectar", nombre: "Conectar" },
      contenidos: [
        {
          grupo_edad_id: "g-exp",
          titulo: "Conectar Exploradores",
          cuerpo: "Texto completo de conectar",
          instruccion_corta: "Lee",
          recurso_id: "img-1",
          recurso_audio_id: "aud-1",
        },
        {
          grupo_edad_id: "g-sem",
          titulo: "Conectar Semillas",
          cuerpo: "Contenido pendiente...",
          instruccion_corta: null,
          recurso_id: null,
          recurso_audio_id: null,
        },
      ],
    },
    {
      orden: 5,
      tipo_paso: { codigo: "experimentar", nombre: "Experimentar" },
      contenidos: [
        {
          grupo_edad_id: "g-exp",
          titulo: "Reto Exploradores",
          cuerpo: "Ponlo en práctica hoy",
          instruccion_corta: null,
          recurso_id: null,
          recurso_audio_id: null,
        },
      ],
      preguntas: [
        { grupo_edad_id: "g-exp", pregunta: "¿Cómo confiarás en Dios?", orden: 1 },
      ],
    },
  ];

  it("extrae únicamente momentos válidos y conserva recursos y preguntas", () => {
    const lista = extraerMomentosReutilizables(sourceSteps, ageGroups);
    expect(lista).toHaveLength(2);
    expect(lista[0]?.draft.resourceId).toBe("img-1");
    expect(lista[0]?.draft.audioResourceId).toBe("aud-1");
    expect(lista[1]?.draft.questions).toEqual([{ pregunta: "¿Cómo confiarás en Dios?", orden: 1 }]);
  });

  it("planifica copia de franja conservando momentos existentes cuando overwriteExisting es false", () => {
    const targetSteps: StepRecord[] = [
      {
        orden: 1,
        tipo_paso: { codigo: "conectar", nombre: "Conectar" },
        contenidos: [
          {
            grupo_edad_id: "g-sem",
            titulo: "Ya escrito",
            cuerpo: "Texto propio de Semillas",
          },
        ],
      },
    ];

    const sinSobrescribir = planificarCopiaFranjaCrecer({
      sourceSteps,
      targetSteps,
      sourceAgeGroupId: "g-exp",
      targetAgeGroupId: "g-sem",
      pasosCatalog,
      overwriteExisting: false,
    });
    expect(sinSobrescribir).toHaveLength(1);
    expect(sinSobrescribir[0]?.stepCode).toBe("experimentar");

    const sobrescribiendo = planificarCopiaFranjaCrecer({
      sourceSteps,
      targetSteps,
      sourceAgeGroupId: "g-exp",
      targetAgeGroupId: "g-sem",
      pasosCatalog,
      overwriteExisting: true,
    });
    expect(sobrescribiendo).toHaveLength(2);
  });
});
