import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { PaginaCards } from "./pagina-cards";

const meta = {
  title: "Páginas/Página de Cards",
  component: PaginaCards,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PaginaCards>;

export default meta;

type Story = StoryObj<typeof meta>;

export const VistaCompleta: Story = {
  name: "🎴 Vista Completa",
  render: () => <PaginaCards />,
};

export const VistaMovil: Story = {
  name: "📱 Vista Móvil",
  globals: { viewport: { value: "movilApp", isRotated: false } },
  render: () => (
    <div className="mx-auto w-[390px] overflow-hidden rounded-[32px] border border-slate-200 shadow-2xl">
      <PaginaCards />
    </div>
  )
};

export const VistaDesktop: Story = {
  name: "🖥️ Vista Desktop",
  globals: { viewport: { value: "escritorio", isRotated: false } },
  render: () => <PaginaCards />
};
