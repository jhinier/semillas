import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Mail, Lock } from "lucide-react";
import { CampoFormulario } from "./campo-formulario";
import { Input, InputContraseña } from "./input";
import { Select } from "./select";
import { Textarea } from "./textarea";

const meta = {
  title: "Componentes/Formulario/CampoFormulario",
  component: CampoFormulario,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    etiqueta: {
      control: "text",
      description: "Leyenda o etiqueta del campo",
    },
    mensajeAyuda: {
      control: "text",
      description: "Leyenda o texto de ayuda inferior",
    },
    mensajeError: {
      control: "text",
      description: "Texto de error de validación (añade automáticamente el estado de error al input)",
    },
    requerido: {
      control: "boolean",
      description: "Muestra un asterisco indicador de obligatoriedad",
    },
  },
} satisfies Meta<typeof CampoFormulario>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConInput: Story = {
  args: {
    id: "correo-campo",
    etiqueta: "Correo Electrónico",
    mensajeAyuda: "Te enviaremos reportes sobre tu progreso.",
    requerido: true,
    className: "w-[320px]",
    children: <Input placeholder="tu@correo.com" iconoIzquierdo={<Mail className="size-4 text-gray-400" />} />
  }
};

export const ConInputError: Story = {
  args: {
    id: "correo-error",
    etiqueta: "Correo Electrónico",
    mensajeError: "La dirección de correo electrónico es inválida",
    requerido: true,
    className: "w-[320px]",
    children: <Input defaultValue="correo@incompleto" iconoIzquierdo={<Mail className="size-4 text-gray-400" />} />
  }
};

export const ConInputContraseña: Story = {
  args: {
    id: "pass-campo",
    etiqueta: "Contraseña",
    mensajeAyuda: "Usa al menos 8 caracteres.",
    requerido: true,
    className: "w-[320px]",
    children: <InputContraseña placeholder="Ingresa tu contraseña" iconoIzquierdo={<Lock className="size-4 text-gray-400" />} />
  }
};

export const ConSelect: Story = {
  args: {
    id: "edad-campo",
    etiqueta: "Franja de Edad",
    mensajeAyuda: "Ajustaremos el contenido del juego según tu edad.",
    requerido: true,
    className: "w-[320px]",
    children: (
      <Select placeholder="Selecciona tu edad">
        <option value="5-8">Semillas (5-8 años)</option>
        <option value="9-12">Exploradores (9-12 años)</option>
        <option value="13-17">Embajadores (13-17 años)</option>
      </Select>
    )
  }
};

export const ConTextarea: Story = {
  args: {
    id: "reflexion-campo",
    etiqueta: "Tu Reflexión",
    mensajeAyuda: "Escribe libremente lo que aprendiste hoy.",
    className: "w-[320px]",
    children: <Textarea placeholder="Hoy aprendí que..." mostrarContador maxCaracteres={150} />
  }
};
