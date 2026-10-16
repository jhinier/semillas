import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Switch } from "./switch";

const meta = {
  title: "Componentes/Formulario/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    etiqueta: {
      control: "text",
      description: "Leyenda o etiqueta del interruptor",
    },
    disabled: {
      control: "boolean",
      description: "Deshabilita la interacción con el switch",
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inactivo: Story = {
  args: {
    etiqueta: "Modo sin conexión desactivado",
    disabled: false,
  },
};

export const Activo: Story = {
  args: {
    etiqueta: "Modo sin conexión activado",
    defaultChecked: true,
  },
};

export const Deshabilitado: Story = {
  args: {
    etiqueta: "Ajuste no disponible",
    disabled: true,
  },
};
