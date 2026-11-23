import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";

import { AgeGroupSelector } from "./age-group-selector";
import { CrecerStepSelector } from "./crecer-step-selector";
import { ActivityEditorWorkspace } from "./activity-editor-workspace";

let CrecerContentEditor: typeof import("./crecer-content-editor")["CrecerContentEditor"];
let prevWindowDescriptor: PropertyDescriptor | undefined;
let prevDocumentDescriptor: PropertyDescriptor | undefined;

beforeAll(async () => {
  // Otros tests pueden dejar mocks parciales de window o document sin documentElement;
  // @mdxeditor/editor y @codemirror/view los leen al importarse.
  const win = (globalThis as { window?: { document?: unknown } }).window;
  if (win && !win.document) {
    prevWindowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
    Reflect.deleteProperty(globalThis, "window");
  }
  const doc = (globalThis as { document?: { documentElement?: unknown } }).document;
  if (doc && !doc.documentElement) {
    prevDocumentDescriptor = Object.getOwnPropertyDescriptor(globalThis, "document");
    Reflect.deleteProperty(globalThis, "document");
  }
  ({ CrecerContentEditor } = await import("./crecer-content-editor"));
});

afterAll(() => {
  if (prevWindowDescriptor) {
    Object.defineProperty(globalThis, "window", prevWindowDescriptor);
  }
  if (prevDocumentDescriptor) {
    Object.defineProperty(globalThis, "document", prevDocumentDescriptor);
  }
});

describe("Flujo unificado CRECER y Quiz en editor admin", () => {
  it("AgeGroupSelector no repite selector interactivo ni otras franjas cuando Paso 1 eligió una sola franja", () => {
    const html = renderToStaticMarkup(
      <AgeGroupSelector
        ageGroups={[{ id: "exp", nombre: "Exploradores", edad_minima: 9, edad_maxima: 12 }]}
        selectedAgeGroupId="exp"
        onSelect={() => undefined}
        onEditAgeGroups={() => undefined}
      />,
    );

    expect(html).toContain("Franja definida en Paso 1: Exploradores");
    expect(html).not.toContain('aria-pressed="true"');
    expect(html).not.toContain("Semillas");
    expect(html).not.toContain("Embajadores");
  });

  it("AgeGroupSelector muestra únicamente las 2 franjas seleccionadas en Paso 1 cuando se eligieron 2 de 3", () => {
    const html = renderToStaticMarkup(
      <AgeGroupSelector
        ageGroups={[
          { id: "sem", nombre: "Semillas", edad_minima: 5, edad_maxima: 8 },
          { id: "exp", nombre: "Exploradores", edad_minima: 9, edad_maxima: 12 },
        ]}
        selectedAgeGroupId="sem"
        onSelect={() => undefined}
        onEditAgeGroups={() => undefined}
      />,
    );

    expect(html).toContain("1. Alterna entre las 2 franjas elegidas en Paso 1");
    expect(html).toContain("Semillas");
    expect(html).toContain("Exploradores");
    expect(html).not.toContain("Embajadores");
  });

  it("CrecerStepSelector y CrecerContentEditor ajustan numeración cuando no hay selector repetido de franja", () => {
    const stepHtml = renderToStaticMarkup(
      <CrecerStepSelector
        stepNumber={1}
        pasos={[{ id: "s1", codigo: "conectar", nombre: "Conectar" }]}
        activeStepCode="conectar"
        selectedAgeGroupId="exp"
        onSelect={() => undefined}
      />,
    );
    expect(stepHtml).toContain("1. Elige el momento (del 1 al 6)");

    const client = new QueryClient();
    const editorHtml = renderToStaticMarkup(
      <QueryClientProvider client={client}>
        <CrecerContentEditor
          stepNumber={2}
          activeStep={{ id: "s2", codigo: "relatar", nombre: "Relatar" }}
          selectedAgeGroup={{ id: "exp", nombre: "Exploradores" }}
          title="Historia de Rut"
          body="Rut decidió acompañar a Noemí con fidelidad y amor."
          shortInstruction=""
          resourceId={null}
          audioResourceId={null}
          resources={[]}
          questions={[]}
          onTitleChange={() => undefined}
          onBodyChange={() => undefined}
          onShortInstructionChange={() => undefined}
          onResourceChange={() => undefined}
          onAudioResourceChange={() => undefined}
          onQuestionsChange={() => undefined}
          onUpload={() => undefined}
          onSave={() => undefined}
          nextStepLabel="Enseñar"
          onNextStep={() => undefined}
          isPending={false}
          isUploading={false}
          isSuccess={false}
          isDirty={false}
          unsavedDraftCount={0}
        />
      </QueryClientProvider>,
    );

    expect(editorHtml).toContain("2. Escribe el contenido: Relatar");
    const idxVisual = editorHtml.indexOf("Recurso visual");
    const idxAudio = editorHtml.indexOf("Narración o audio");
    const idxNextBtn = editorHtml.indexOf("Siguiente momento: Enseñar");
    expect(idxVisual).toBeGreaterThan(-1);
    expect(idxAudio).toBeGreaterThan(idxVisual);
    expect(idxNextBtn).toBeGreaterThan(idxAudio);
  });

  it("ActivityEditorWorkspace muestra edad como solo lectura en contexto cuando el tema tiene una sola franja", () => {
    const html = renderToStaticMarkup(
      <ActivityEditorWorkspace
        draft={{
          paso_id: "p1",
          grupo_edad_id: "exp",
          tipo_actividad_id: "tipo-quiz",
          titulo: "Quiz bíblico",
          consigna: "Elige la respuesta correcta",
          retroalimentacion: "",
          xp_recompensa: 20,
          limite_tiempo_seg: null,
          dificultad: "facil",
          obligatorio: true,
          configuracion: {},
          opciones: [],
        }}
        onChange={() => undefined}
        configText="{}"
        onConfigTextChange={() => undefined}
        steps={[{ id: "p1", tipo_paso: { nombre: "Comprobar" } }]}
        groups={[{ id: "exp", nombre: "Exploradores" }]}
        types={[
          {
            id: "tipo-quiz",
            codigo: "cuestionario",
            nombre: "Quiz",
            descripcion: "Pregunta con opciones",
            es_juego: false,
          },
        ]}
        resources={[]}
        selectedTypeCode="cuestionario"
        tab="contexto"
        onTabChange={() => undefined}
        onTypeChange={() => undefined}
        onUpload={() => undefined}
        uploading={false}
        saving={false}
        dirty={false}
        isEditMode={false}
        onSave={() => undefined}
        onClose={() => undefined}
      />,
    );

    expect(html).toContain("Definida en Paso 1");
    expect(html).toContain("Exploradores");
    expect(html).not.toContain("Selecciona una edad");
  });

  it("ActivityEditorWorkspace muestra un único bloque de opciones para Quiz y nunca duplica Opciones de respuesta", () => {
    const html = renderToStaticMarkup(
      <ActivityEditorWorkspace
        draft={{
          paso_id: "p1",
          grupo_edad_id: "exp",
          tipo_actividad_id: "tipo-quiz",
          titulo: "Quiz bíblico",
          consigna: "Elige la respuesta correcta",
          retroalimentacion: "",
          xp_recompensa: 20,
          limite_tiempo_seg: null,
          dificultad: "facil",
          obligatorio: true,
          configuracion: {
            opciones: [
              { id: "opcion-1", texto: "Opción A", correcta: true },
              { id: "opcion-2", texto: "Opción B", correcta: false },
            ],
          },
          opciones: [
            { etiqueta: "A", texto: "Opción A", correcta: true, orden: 1 },
            { etiqueta: "B", texto: "Opción B", correcta: false, orden: 2 },
          ],
        }}
        onChange={() => undefined}
        configText="{}"
        onConfigTextChange={() => undefined}
        steps={[{ id: "p1", tipo_paso: { nombre: "Comprobar" } }]}
        groups={[{ id: "exp", nombre: "Exploradores" }]}
        types={[
          {
            id: "tipo-quiz",
            codigo: "cuestionario",
            nombre: "Quiz",
            descripcion: "Pregunta con opciones",
            es_juego: false,
          },
        ]}
        resources={[]}
        selectedTypeCode="cuestionario"
        tab="mecanica"
        onTabChange={() => undefined}
        onTypeChange={() => undefined}
        onUpload={() => undefined}
        uploading={false}
        saving={false}
        dirty={false}
        isEditMode={false}
        onSave={() => undefined}
        onClose={() => undefined}
      />,
    );

    expect(html.match(/<fieldset/g)?.length).toBe(1);
    expect(html).toContain("Opción A");
    expect(html).not.toContain("Opciones de respuesta");
  });
});
