import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Mail, Lock, Search, User } from "lucide-react";
import { Input, InputBusqueda, InputContraseña } from "./input";

const meta = {
  title: "Componentes/Formulario/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    estado: {
      control: "select",
      options: ["default", "error", "exito"],
      description: "Estado de validación visual del campo",
    },
    mensajeError: {
      control: "text",
      description: "Mensaje de error a desplegar bajo el input",
    },
    mensajeExito: {
      control: "text",
      description: "Mensaje de confirmación a desplegar bajo el input",
    },
    disabled: {
      control: "boolean",
      description: "Deshabilita la interacción con el campo",
    },
    placeholder: {
      control: "text",
      description: "Texto guía del campo vacío",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Escribe tu nombre...",
    disabled: false,
    estado: "default",
  },
};

export const ConIcono: Story = {
  args: {
    placeholder: "Correo electrónico",
    iconoIzquierdo: <Mail className="size-4 text-gray-400" />,
  },
};

export const ConError: Story = {
  args: {
    placeholder: "nombre@correo",
    estado: "error",
    mensajeError: "El formato de correo no es válido",
  },
};

export const ConExito: Story = {
  args: {
    placeholder: "nombre@correo.com",
    estado: "exito",
    mensajeExito: "¡Correo disponible!",
  },
};

export const Busqueda: StoryObj<typeof InputBusqueda> = {
  render: (args) => <InputBusqueda {...args} placeholder="Buscar lecciones, temas..." />,
};

export const Contraseña: StoryObj<typeof InputContraseña> = {
  render: (args) => <InputContraseña {...args} placeholder="Ingresa tu contraseña" iconoIzquierdo={<Lock className="size-4 text-gray-400" />} />,
};
