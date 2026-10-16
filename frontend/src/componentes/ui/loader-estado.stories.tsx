import type { Meta, StoryObj } from "@storybook/react-vite";

import { LoaderEstado } from "./loader-estado";

const meta = {
  title: "Componentes/Estado/LoaderEstado",
  component: LoaderEstado,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  argTypes: {
    mensaje: {
      control: "text"
    }
  }
} satisfies Meta<typeof LoaderEstado>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CargandoContenido: Story = {
  args: {
    mensaje: "Cargando contenido..."
  }
};

export const Sincronizando: Story = {
  args: {
    mensaje: "Sincronizando progreso..."
  }
};

export const GuardandoCambios: Story = {
  args: {
    mensaje: "Guardando cambios..."
  }
};

export const VistaComparativa: Story = {
  parameters: {
    layout: "fullscreen"
  },
  render: () => (
    <div className="min-h-screen bg-[#F7F4EC] p-6">
      <div className="mx-auto grid max-w-xl gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <LoaderEstado mensaje="Cargando contenido..." />
        <LoaderEstado mensaje="Sincronizando progreso..." />
        <LoaderEstado mensaje="Guardando cambios..." />
      </div>
    </div>
  )
};
