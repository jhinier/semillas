import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Award, Book, Flame, Heart } from "lucide-react";
import { CardInsignia } from "./card-insignia";

const iconMap = {
  Award: <Award />,
  Book: <Book />,
  Flame: <Flame />,
  Heart: <Heart />
};

const meta = {
  title: "Componentes/Card/Insignia",
  component: CardInsignia,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    titulo: {
      control: "text",
      description: "Título de la insignia",
    },
    descripcion: {
      control: "text",
      description: "Requisitos o descripción de la insignia",
    },
    obtenida: {
      control: "boolean",
      description: "Indica si el usuario ya desbloqueó este logro",
    },
    color: {
      control: "select",
      options: ["verde", "morado", "amarillo", "gris"],
      description: "Esquema de color de fondo y borde de la insignia",
    },
    icono: {
      control: "select",
      options: Object.keys(iconMap),
      mapping: iconMap,
      description: "Icono vectorial central de la insignia",
    },
    progresoActual: {
      control: { type: "number", min: 0, max: 20 },
      description: "Progreso acumulado (solo si obtenida es false)",
    },
    progresoMaximo: {
      control: { type: "number", min: 1, max: 20 },
      description: "Progreso requerido (solo si obtenida es false)",
    },
  },
} satisfies Meta<typeof CardInsignia>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesbloqueadaVerde: Story = {
  args: {
    titulo: "Primer Paso",
    descripcion: "Completaste tu primera lección en la plataforma.",
    obtenida: true,
    color: "verde",
    icono: "Award" as any,
  },
};

export const EnProgresoMorada: Story = {
  args: {
    titulo: "Sembrador Fiel",
    descripcion: "Completa 10 lecciones bíblicas en total.",
    obtenida: false,
    color: "morado",
    icono: "Book" as any,
    progresoActual: 6,
    progresoMaximo: 10,
  },
};

export const DesbloqueadaAmarilla: Story = {
  args: {
    titulo: "Racha Heroica",
    descripcion: "Alcanza una racha de 7 días seguidos de lectura.",
    obtenida: true,
    color: "amarillo",
    icono: "Flame" as any,
  },
};

export const BloqueadaGris: Story = {
  args: {
    titulo: "Corazón Limpio",
    descripcion: "Completa la senda del Hijo de Dios.",
    obtenida: false,
    color: "gris",
    icono: "Heart" as any,
  },
};
