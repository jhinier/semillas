import type { Meta, StoryObj } from "@storybook/react-vite";

import { EmptyState } from "./empty-state";

const meta = {
  title: "Componentes/Estado/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  argTypes: {
    mensaje: {
      control: "text"
    }
  }
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SinResultados: Story = {
  args: {
    mensaje: "No se encontraron resultados."
  }
};

export const SinLecciones: Story = {
  args: {
    mensaje: "Todavía no descargaste ninguna lección para jugar sin conexión."
  }
};

export const MensajeLargo: Story = {
  args: {
    mensaje: "Aún no tienes temas guardados. Descarga uno para seguir aprendiendo cuando no haya internet."
  }
};

export const Comparativa: Story = {
  parameters: {
    layout: "fullscreen"
  },
  render: () => (
    <div className="min-h-screen bg-[#F7F4EC] p-6">
      <div className="mx-auto grid max-w-3xl gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3">
        <EmptyState mensaje="No hay datos por mostrar." />
        <EmptyState mensaje="Todavía no descargaste contenido." />
        <EmptyState mensaje="No encontré coincidencias con ese filtro." />
      </div>
    </div>
  )
};
