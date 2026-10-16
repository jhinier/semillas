import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Checkbox } from "./checkbox";

const meta = {
  title: "Componentes/Formulario/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    etiqueta: {
      control: "text",
      description: "Leyenda o etiqueta al lado del checkbox",
    },
    disabled: {
      control: "boolean",
      description: "Deshabilita la interacción con el checkbox",
    },
    indeterminate: {
      control: "boolean",
      description: "Establece el estado indeterminado",
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    etiqueta: "Acepto los términos y condiciones de privacidad",
    disabled: false,
    indeterminate: false,
  },
};

export const Seleccionado: Story = {
  args: {
    etiqueta: "Lección completada",
    defaultChecked: true,
  },
};

export const Indeterminado: Story = {
  args: {
    etiqueta: "Progreso parcial",
    indeterminate: true,
  },
};

export const Deshabilitado: Story = {
  args: {
    etiqueta: "No disponible temporalmente",
    disabled: true,
  },
};
