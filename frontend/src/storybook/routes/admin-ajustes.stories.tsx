import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryRouter } from "@/storybook/story-router";
import { Settings, Bell, Lock, Globe } from "lucide-react";

function AdminAjustesStory() {
  return (
    <StoryRouter initialPath="/admin/ajustes">
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="text-slate-600" size={28} />
          <h1 className="text-2xl font-black text-slate-800">Configuración General</h1>
        </div>
        <div className="space-y-4">
          {[
            { icon: Bell, label: "Notificaciones", desc: "Configurar alertas y mensajes" },
            { icon: Lock, label: "Seguridad", desc: "Contraseñas y autenticación" },
            { icon: Globe, label: "Idioma y región", desc: "Español · Ecuador" },
          ].map((item) => (
            <button key={item.label} className="w-full bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left">
              <item.icon className="text-green-600 shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-slate-800">{item.label}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </StoryRouter>
  );
}

const meta = {
  title: "Pantallas/Admin/Ajustes",
  component: AdminAjustesStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AdminAjustesStory>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
