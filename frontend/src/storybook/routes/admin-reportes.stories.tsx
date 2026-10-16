import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryRouter } from "@/storybook/story-router";
import { BarChart3 } from "lucide-react";

function AdminReportesStory() {
  return (
    <StoryRouter initialPath="/admin/reportes">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="text-blue-600" size={28} />
          <h1 className="text-2xl font-black text-slate-800">Reportes y Estadísticas</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Usuarios activos", value: "1,284", delta: "+12%" },
            { label: "Temas completados", value: "8,432", delta: "+8%" },
            { label: "XP total generado", value: "45,230", delta: "+15%" },
            { label: "Tiempo promedio", value: "18 min", delta: "-3%" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <p className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{stat.value}</p>
              <p className="text-xs text-green-600 font-medium">{stat.delta}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-center py-12">Gráficos interactivos en desarrollo.</p>
        </div>
      </div>
    </StoryRouter>
  );
}

const meta = {
  title: "Pantallas/Admin/Reportes",
  component: AdminReportesStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AdminReportesStory>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
