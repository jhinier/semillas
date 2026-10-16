import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProgresoCircular } from "./progreso-circular";

const meta = {
  title: "Componentes/Indicadores/ProgresoCircular",
  component: ProgresoCircular,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  argTypes: {
    porcentaje: {
      control: { type: "range", min: 0, max: 100, step: 5 }
    },
    color: {
      control: "select",
      options: ["morado", "verde", "naranja", "azul"]
    },
    tamano: {
      control: { type: "range", min: 48, max: 120, step: 8 }
    }
  }
} satisfies Meta<typeof ProgresoCircular>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    porcentaje: 65,
    etiqueta: "Progreso",
    color: "morado",
    tamano: 72
  }
};

export const CasiCompleto: Story = {
  args: {
    porcentaje: 90,
    etiqueta: "Racha",
    color: "verde",
    tamano: 80
  }
};

export const ALaMitad: Story = {
  args: {
    porcentaje: 50,
    etiqueta: "Lecciones",
    color: "naranja",
    tamano: 64
  }
};

export const Comparativa: Story = {
  args: {
    porcentaje: 65,
    etiqueta: "Progreso",
    color: "morado",
    tamano: 72
  },
  parameters: {
    layout: "fullscreen"
  },
  render: () => (
    <div className="min-h-screen bg-[#F7F4EC] p-6">
      <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <ProgresoCircular porcentaje={20} etiqueta="Inicio" color="morado" tamano={64} />
        <ProgresoCircular porcentaje={45} etiqueta="Avance" color="verde" tamano={72} />
        <ProgresoCircular porcentaje={80} etiqueta="Racha" color="naranja" tamano={80} />
        <ProgresoCircular porcentaje={100} etiqueta="Meta" color="azul" tamano={88} />
      </div>
    </div>
  )
};
