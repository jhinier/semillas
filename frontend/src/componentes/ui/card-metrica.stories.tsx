import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { CardMetrica } from "./card-metrica";

const meta = {
  title: "Componentes/Card/Metrica",
  component: CardMetrica,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    tipo: {
      control: "select",
      options: ["xp", "racha", "lecciones", "offline"],
      description: "Tipo de métrica de gamificación a renderizar",
    },
    titulo: {
      control: "text",
      description: "Título superior o etiqueta de la métrica",
    },
    valor: {
      control: "text",
      description: "Valor principal de la estadística",
    },
    subtexto: {
      control: "text",
      description: "Leyenda o incremento inferior",
    },
  },
} satisfies Meta<typeof CardMetrica>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PuntosDeExperiencia: Story = {
  args: {
    titulo: "Puntos de Experiencia",
    valor: "1,240 XP",
    subtexto: "+150 XP esta semana",
    tipo: "xp",
    clase: "w-[280px]"
  },
};

export const RachaDiaria: Story = {
  args: {
    titulo: "Racha Actual",
    valor: "7 Días",
    subtexto: "¡Mantén el fuego encendido!",
    tipo: "racha",
    clase: "w-[280px]"
  },
};

export const LeccionesCompletadas: Story = {
  args: {
    titulo: "Lecciones",
    valor: "18 Completadas",
    subtexto: "85% del camino recorrido",
    tipo: "lecciones",
    clase: "w-[280px]"
  },
};

export const DescargasOffline: Story = {
  args: {
    titulo: "Mis descargas",
    valor: "4 Lecciones",
    subtexto: "Listas para jugar sin internet",
    tipo: "offline",
    clase: "w-[280px]"
  },
};
