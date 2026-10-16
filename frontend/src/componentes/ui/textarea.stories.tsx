import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Textarea } from "./textarea";

const meta = {
  title: "Componentes/Formulario/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    estado: {
      control: "select",
      options: ["default", "error", "exito"],
      description: "Estado de validación del área de texto",
    },
    mensajeError: {
      control: "text",
      description: "Mensaje de error inferior",
    },
    mostrarContador: {
      control: "boolean",
      description: "Habilita o deshabilita el contador de caracteres",
    },
    maxCaracteres: {
      control: { type: "number", min: 10, max: 500, step: 10 },
      description: "Número máximo de caracteres permitidos",
    },
    placeholder: {
      control: "text",
      description: "Texto de ayuda interno",
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Escribe tu reflexión sobre la lección...",
    mostrarContador: true,
    maxCaracteres: 200,
    estado: "default",
  },
};

export const ConError: Story = {
  args: {
    ...Default.args,
    estado: "error",
    mensajeError: "Has excedido el límite de caracteres",
    defaultValue: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nec arcu id elit efficitur eleifend. Suspendisse eu ante sed justo sollicitudin finibus sit amet pulvinar lectus. Vestibulum tristique sodales.",
  },
};
