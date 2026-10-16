import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryRouter } from "@/storybook/story-router";
import { Route } from "lucide-react";

function AdminSendasStory() {
  return (
    <StoryRouter initialPath="/admin/sendas">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Route className="text-green-600" size={28} />
          <h1 className="text-2xl font-black text-slate-800">Gestión de Sendas</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { nombre: "Senda del Padre", color: "bg-blue-500", temas: 12 },
            { nombre: "Senda del Hijo", color: "bg-amber-500", temas: 10 },
            { nombre: "Senda del Espíritu Santo", color: "bg-teal-500", temas: 8 },
          ].map((senda) => (
            <div key={senda.nombre} className={`${senda.color} rounded-2xl p-6 text-white`}>
              <h3 className="text-xl font-black mb-2">{senda.nombre}</h3>
              <p className="opacity-80">{senda.temas} temas disponibles</p>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-slate-500">Panel de edición de sendas — CRUD completo.</p>
        </div>
      </div>
    </StoryRouter>
  );
}

const meta = {
  title: "Pantallas/Admin/Sendas",
  component: AdminSendasStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AdminSendasStory>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
