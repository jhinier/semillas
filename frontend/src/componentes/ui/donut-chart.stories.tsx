import type { Meta, StoryObj } from "@storybook/react-vite";
import { DonutChart, LeyendaDonut } from "./donut-chart";

const meta = {
  title: "Componentes/DonutChart",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

const sectoresBasicos = [
  { label: "Completados", valor: 45, color: "#2E9E5B" },
  { label: "En progreso", valor: 30, color: "#F4B740" },
  { label: "No iniciados", valor: 25, color: "#E2E8F0" },
];

export const Basico: StoryObj = {
  render: () => (
    <DonutChart
      sectores={sectoresBasicos}
      etiquetaTotal="Lecciones"
    />
  ),
};

export const ConLeyenda: StoryObj = {
  render: () => {
    const sectores = [
      { label: "Completados", valor: 45, color: "#2E9E5B" },
      { label: "En progreso", valor: 30, color: "#F4B740" },
      { label: "No iniciados", valor: 25, color: "#E2E8F0" },
    ];
    const total = sectores.reduce((acc, s) => acc + s.valor, 0);
    const sectoresConPorcentaje = sectores.map(s => ({
      ...s,
      porcentaje: Math.round((s.valor / total) * 100),
    }));

    return (
      <div className="flex gap-8 items-center">
        <DonutChart sectores={sectores} etiquetaTotal="Total" tamano={120} />
        <LeyendaDonut sectores={sectoresConPorcentaje} />
      </div>
    );
  },
};

export const TamanoPequeno: StoryObj = {
  render: () => (
    <DonutChart
      sectores={sectoresBasicos}
      etiquetaTotal="XP"
      tamano={80}
    />
  ),
};

export const TamanoGrande: StoryObj = {
  render: () => (
    <DonutChart
      sectores={sectoresBasicos}
      etiquetaTotal="Actividades"
      tamano={180}
    />
  ),
};

export const DocumentacionCompleta: StoryObj = {
  name: "📄 Documentación Completa",
  parameters: {
    layout: "fullscreen",
  },
  render: () => {
    const sectoresProgreso = [
      { label: "Completados", valor: 12, color: "#2E9E5B" },
      { label: "En progreso", valor: 5, color: "#F4B740" },
      { label: "No iniciados", valor: 8, color: "#E2E8F0" },
    ];
    const totalProgreso = sectoresProgreso.reduce((acc, s) => acc + s.valor, 0);

    const sectoresXP = [
      { label: "Lecciones", valor: 350, color: "#6C3AED" },
      { label: "Quiz", valor: 180, color: "#0EA5E9" },
      { label: "Actividades", valor: 120, color: "#10B981" },
    ];
    const totalXP = sectoresXP.reduce((acc, s) => acc + s.valor, 0);

    return (
      <div className="min-h-screen bg-white font-sans p-8">
        <div className="max-w-4xl">
          <h1 className="mb-6 text-3xl font-extrabold text-slate-900">DonutChart</h1>
          <p className="mb-8 text-slate-500">
            Gráfico de dona para mostrar proporciones. Incluye DonutChart y LeyendaDonut.
          </p>

          <section className="mb-8">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">Tamaños</h2>
            <div className="flex items-end gap-8">
              <div className="text-center">
                <DonutChart sectores={sectoresBasicos} etiquetaTotal="Small" tamano={80} />
                <p className="text-xs text-slate-400 mt-2">80px</p>
              </div>
              <div className="text-center">
                <DonutChart sectores={sectoresBasicos} etiquetaTotal="Medium" tamano={120} />
                <p className="text-xs text-slate-400 mt-2">120px (default)</p>
              </div>
              <div className="text-center">
                <DonutChart sectores={sectoresBasicos} etiquetaTotal="Large" tamano={160} />
                <p className="text-xs text-slate-400 mt-2">160px</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">Con leyenda</h2>
            <div className="p-6 border rounded-xl">
              <div className="flex gap-12 items-center">
                <DonutChart sectores={sectoresProgreso} etiquetaTotal="Lecciones" tamano={140} />
                <LeyendaDonut
                  sectores={sectoresProgreso.map(s => ({
                    ...s,
                    porcentaje: Math.round((s.valor / totalProgreso) * 100),
                  }))}
                />
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">Ejemplo: XP por categoría</h2>
            <div className="p-6 border rounded-xl">
              <div className="flex gap-12 items-center">
                <DonutChart sectores={sectoresXP} etiquetaTotal="XP Total" tamano={140} />
                <LeyendaDonut
                  sectores={sectoresXP.map(s => ({
                    ...s,
                    porcentaje: Math.round((s.valor / totalXP) * 100),
                  }))}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  },
};
