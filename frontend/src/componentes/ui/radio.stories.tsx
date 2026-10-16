import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Radio } from "./radio";

const meta = {
  title: "Componentes/Formulario/Radio",
  component: Radio,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    etiqueta: {
      control: "text",
      description: "Leyenda o etiqueta del botón radial",
    },
    disabled: {
      control: "boolean",
      description: "Deshabilita la interacción con el radio",
    },
    name: {
      control: "text",
      description: "Nombre de agrupación de controles de opción",
    },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "opcion-grupo",
    etiqueta: "Opción Uno",
    value: "1",
    disabled: false,
  },
};

export const Seleccionado: Story = {
  args: {
    name: "opcion-grupo",
    etiqueta: "Opción Dos (Seleccionado)",
    value: "2",
    defaultChecked: true,
  },
};

export const Deshabilitado: Story = {
  args: {
    name: "opcion-grupo",
    etiqueta: "Opción Tres (Deshabilitado)",
    value: "3",
    disabled: true,
  },
};
