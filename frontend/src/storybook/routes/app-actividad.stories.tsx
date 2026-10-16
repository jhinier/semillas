import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryRouter } from "@/storybook/story-router";
import { Zap } from "lucide-react";

const opcionesAct = [
  { id: "opt1", etiqueta: "A", texto: "Jesús sanó a los enfermos" },
  { id: "opt2", etiqueta: "B", texto: "Jesús construyó un templo" },
  { id: "opt3", etiqueta: "C", texto: "Jesús predicó en otra ciudad" },
];

function ActividadStory() {
  return (
    <StoryRouter initialPath="/app/actividades/act-test">
      <div className="max-w-xl mx-auto p-4">
        <button className="flex items-center gap-1 text-sm text-slate-500 mb-4">← Volver</button>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-amber-500" size={18} />
            <span className="text-sm font-medium text-amber-500">20 XP</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">¿Qué milagro realizó Jesús?</h1>
          <p className="text-slate-600 mb-6">Selecciona la respuesta correcta.</p>
          <div className="grid gap-2">
            {opcionesAct.map((opt) => (
              <button key={opt.id} className="w-full text-left p-4 rounded-xl border-2 bg-slate-50 border-transparent hover:bg-slate-100 transition-all">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-sm shrink-0">{opt.etiqueta}</span>
                  <span className="flex-1 text-slate-700">{opt.texto}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-green-600 font-bold">¡Correcto!</span>
            </div>
            <p className="text-sm text-slate-600">Ganaste 20 XP</p>
          </div>
          <button className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">
            Volver al inicio
          </button>
        </div>
      </div>
    </StoryRouter>
  );
}

function ActividadLoading() {
  return (
    <StoryRouter initialPath="/app/actividades/act-test">
      <div className="flex justify-center py-20">
        <div className="animate-spin text-green-600 w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
      </div>
    </StoryRouter>
  );
}

const meta = {
  title: "Pantallas/App/Actividad",
  component: ActividadStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ActividadStory>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
export const Cargando: Story = { render: () => <ActividadLoading /> };
