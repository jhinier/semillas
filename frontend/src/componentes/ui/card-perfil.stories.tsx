import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { CardPerfil } from "./card-perfil";

const meta = {
  title: "Componentes/Card/Perfil",
  component: CardPerfil,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    nombre: {
      control: "text",
      description: "Apodo o nombre visible del semillero",
    },
    nivel: {
      control: { type: "number", min: 1, max: 100 },
      description: "Nivel acumulado en base a XP",
    },
    racha: {
      control: { type: "number", min: 0, max: 365 },
      description: "Días de racha consecutiva",
    },
    lecciones: {
      control: { type: "number", min: 0, max: 200 },
      description: "Total de lecciones completadas",
    },
    logros: {
      control: { type: "number", min: 0, max: 50 },
      description: "Total de insignias obtenidas",
    },
    xpActual: {
      control: { type: "range", min: 0, max: 2000, step: 20 },
      description: "Puntos de XP actuales del nivel",
    },
    xpMaximo: {
      control: { type: "number", min: 100, max: 2000, step: 50 },
      description: "Puntos de XP requeridos para pasar de nivel",
    },
    avatarUrl: {
      control: "text",
      description: "URL de la imagen de perfil/avatar",
    },
  },
} satisfies Meta<typeof CardPerfil>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    nombre: "Felipe el Explorador",
    nivel: 8,
    racha: 12,
    lecciones: 24,
    logros: 8,
    xpActual: 720,
    xpMaximo: 1000,
    avatarUrl: "https://api.dicebear.com/6.x/avataaars/svg?seed=Felix",
    onVerPerfil: () => alert("Ver perfil del semillero"),
  },
};

export const NivelInicial: Story = {
  args: {
    ...Playground.args,
    nombre: "Mateo Semillita",
    nivel: 1,
    racha: 2,
    lecciones: 1,
    logros: 1,
    xpActual: 40,
    xpMaximo: 200,
    avatarUrl: "https://api.dicebear.com/6.x/avataaars/svg?seed=Nico",
  },
};
