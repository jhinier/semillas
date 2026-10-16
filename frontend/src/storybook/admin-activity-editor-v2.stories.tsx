import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import {
  ActivityEditorWorkspace,
  type ActivityEditorTab,
} from "@/features/admin/componentes/temas/activity-editor-workspace";
import { ActivityDraftPreview } from "@/features/admin/componentes/temas/activity-draft-preview";
import { defaultOptions, emptyDraft, type ActivityDraft } from "@/features/admin/types";
import "@/routes/admin-content-studio.css";
import "@/routes/admin-activities-studio.css";

const meta = {
  title: "Admin/Actividades/Editor v2",
  component: ActivityEditorWorkspace,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ActivityEditorWorkspace>;

export default meta;
type Story = StoryObj<typeof meta>;

const groups = [
  { id: "semillas", nombre: "Semillas (5–8 años)" },
  { id: "exploradores", nombre: "Exploradores (9–12 años)" },
  { id: "embajadores", nombre: "Embajadores (13–17 años)" },
];

const steps = [
  { id: "conectar", tipo_paso: { nombre: "Conectar" } },
  { id: "relatar", tipo_paso: { nombre: "Relatar" } },
  { id: "comprobar", tipo_paso: { nombre: "Comprobar" } },
];

const types = [
  { id: "quiz", codigo: "cuestionario", nombre: "Quiz", descripcion: "Pregunta con respuestas y una opción correcta.", es_juego: true },
  { id: "sopa", codigo: "sopa_letras", nombre: "Sopa de letras", descripcion: "Encuentra palabras dentro de una cuadrícula.", es_juego: true },
  { id: "audio", codigo: "actividad_audio", nombre: "Audio", descripcion: "Escucha un recurso y completa la experiencia.", es_juego: false },
];

function EditorDemo({ initialTab = "contexto" }: { initialTab?: ActivityEditorTab }) {
  const [tab, setTab] = useState<ActivityEditorTab>(initialTab);
  const [draft, setDraft] = useState<ActivityDraft>({
    ...emptyDraft,
    paso_id: "comprobar",
    grupo_edad_id: "exploradores",
    tipo_actividad_id: "quiz",
    titulo: "El amor de Dios",
    consigna: "Selecciona la respuesta que mejor completa la enseñanza.",
    retroalimentacion: "¡Muy bien! Dios nos ama y nos enseña a amar.",
    xp_recompensa: 20,
    opciones: defaultOptions.map((option, index) => ({
      ...option,
      texto: ["Nos cuida siempre", "Solo nos ayuda a veces", "No escucha nuestras oraciones", "Nos deja solos"][index] ?? "",
    })),
  });
  const [configText, setConfigText] = useState("{}");

  return (
    <div className="admin-activity-studio-page" style={{ background: "#f4f6fa", minHeight: "100vh" }}>
      <ActivityEditorWorkspace
        draft={draft}
        onChange={setDraft}
        configText={configText}
        onConfigTextChange={setConfigText}
        steps={steps}
        groups={groups}
        types={types}
        selectedTypeCode={types.find((type) => type.id === draft.tipo_actividad_id)?.codigo ?? ""}
        tab={tab}
        onTabChange={setTab}
        onTypeChange={(typeId) => setDraft((current) => ({ ...current, tipo_actividad_id: typeId, configuracion: {} }))}
        onUpload={() => undefined}
        uploading={false}
        saving={false}
        dirty
        isEditMode
        onSave={() => undefined}
        onClose={() => undefined}
      />
    </div>
  );
}

export const Contexto: Story = { render: () => <EditorDemo /> };
export const MecanicaQuiz: Story = { render: () => <EditorDemo initialTab="mecanica" /> };
export const VistaPrevia: Story = { render: () => <EditorDemo initialTab="preview" /> };

export const PreviewAislada: Story = {
  render: () => (
    <div className="admin-activity-studio-page" style={{ background: "#f4f6fa", minHeight: "100vh" }}>
      <ActivityDraftPreview
        draft={{
          ...emptyDraft,
          paso_id: "comprobar",
          grupo_edad_id: "exploradores",
          tipo_actividad_id: "quiz",
          titulo: "El amor de Dios",
          consigna: "Selecciona la respuesta correcta.",
          opciones: defaultOptions.map((option, index) => ({ ...option, texto: `Respuesta ${index + 1}` })),
        }}
        typeCode="cuestionario"
        typeName="Quiz"
        ageGroupName="Exploradores"
        stepName="Comprobar"
      />
    </div>
  ),
};
