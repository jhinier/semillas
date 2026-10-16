import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Select } from "./select";

const meta = {
  title: "Componentes/Formulario/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    estado: {
      control: "select",
      options: ["default", "error", "exito"],
      description: "Estado visual del selector",
    },
    mensajeError: {
      control: "text",
      description: "Mensaje de error inferior",
    },
    disabled: {
      control: "boolean",
      description: "Deshabilita el selector",
    },
    placeholder: {
      control: "text",
      description: "Texto guía opcional",
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Selecciona tu grupo de edad",
    disabled: false,
    estado: "default",
    children: (
      <>
        <option value="semillas">Semillas (5-8 años)</option>
        <option value="exploradores">Exploradores (9-12 años)</option>
        <option value="embajadores">Embajadores (13-17 años)</option>
      </>
    )
  },
};

export const ConError: Story = {
  args: {
    ...Default.args,
    estado: "error",
    mensajeError: "Este campo es requerido",
  },
};

export const Deshabilitado: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};
