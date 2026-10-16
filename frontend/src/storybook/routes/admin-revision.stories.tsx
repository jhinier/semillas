import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryRouter } from "@/storybook/story-router";
import { FileCheck, Clock } from "lucide-react";

function AdminRevisionStory() {
  return (
    <StoryRouter initialPath="/admin/revision">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FileCheck className="text-purple-600" size={28} />
          <h1 className="text-2xl font-black text-slate-800">Revisión de Contenido</h1>
        </div>
        <div className="space-y-4">
          {[
            { titulo: "El Amor en Acción", estado: "revision", autor: "Admin", fecha: "2026-07-08" },
            { titulo: "La Oración Diaria", estado: "borrador", autor: "Editor1", fecha: "2026-07-07" },
            { titulo: "Milagros de Jesús", estado: "revision", autor: "Admin", fecha: "2026-07-09" },
          ].map((tema) => (
            <div key={tema.titulo} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">{tema.titulo}</h3>
                <p className="text-sm text-slate-400">{tema.autor} · {tema.fecha}</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-500" />
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase">{tema.estado}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StoryRouter>
  );
}

const meta = {
  title: "Pantallas/Admin/Revision",
  component: AdminRevisionStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AdminRevisionStory>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
