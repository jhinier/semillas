import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { PaginaLogros } from "./pagina-logros";

const meta = {
  title: "Páginas/Página de Logros",
  component: PaginaLogros,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PaginaLogros>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PantallaCompleta: Story = {
  name: "🏆 Pantalla Completa",
  render: () => <PaginaLogros />,
};

export const VistaMovil: Story = {
  name: "📱 Vista Móvil",
  globals: { viewport: { value: "movilApp", isRotated: false } },
  render: () => (
    <div className="mx-auto w-[390px] overflow-hidden rounded-[32px] border border-slate-200 shadow-2xl">
      <PaginaLogros />
    </div>
  )
};

export const VistaDesktop: Story = {
  name: "🖥️ Vista Desktop",
  globals: { viewport: { value: "escritorio", isRotated: false } },
  render: () => <PaginaLogros />
};
