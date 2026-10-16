import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryRouter } from "@/storybook/story-router";
import { Users, Shield } from "lucide-react";

function AdminClubesStory() {
  return (
    <StoryRouter initialPath="/admin/clubes">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Users className="text-green-600" size={28} />
          <h1 className="text-2xl font-black text-slate-800">Gestión de Clubes</h1>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-slate-500 mb-4">Panel de administración de clubes — contenido en desarrollo.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { nombre: "Club Semillas de Luz", miembros: 24, retos: 5 },
              { nombre: "Club Amigos de Jesús", miembros: 18, retos: 3 },
              { nombre: "Club Río de Vida", miembros: 31, retos: 7 },
            ].map((club) => (
              <div key={club.nombre} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-1">{club.nombre}</h3>
                <p className="text-sm text-slate-500">{club.miembros} miembros · {club.retos} retos activos</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StoryRouter>
  );
}

const meta = {
  title: "Pantallas/Admin/Clubes",
  component: AdminClubesStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AdminClubesStory>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
