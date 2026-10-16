import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { CardLeccion } from "./card-leccion";

const meta = {
  title: "Componentes/Card/Leccion",
  component: CardLeccion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    estado: {
      control: "select",
      options: ["porDefecto", "enProgreso", "completada", "descargada", "bloqueada", "error"],
      description: "Estado visual y de progreso de la lección",
    },
    senda: {
      control: "text",
      description: "Nombre de la senda bíblica",
    },
    titulo: {
      control: "text",
      description: "Título de la lección",
    },
    descripcion: {
      control: "text",
      description: "Descripción resumida",
    },
    duracion: {
      control: "text",
      description: "Duración aproximada de la lección",
    },
    xp: {
      control: { type: "number", min: 10, max: 500, step: 10 },
      description: "Puntos de Experiencia otorgados",
    },
    progreso: {
      control: { type: "range", min: 0, max: 100, step: 5 },
      description: "Porcentaje de progreso realizado (solo estados enProgreso/completada)",
    },
    favorito: {
      control: "boolean",
      description: "Estado favorito de la lección",
    },
  },
} satisfies Meta<typeof CardLeccion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    estado: "porDefecto",
    senda: "Senda del Padre",
    titulo: "La Creación del Mundo",
    descripcion: "Descubre cómo Dios creó los cielos y la tierra en seis días increíbles y descansó el séptimo.",
    duracion: "10 min",
    xp: 100,
    progreso: 0,
    favorito: false,
    onAccion: () => alert("Acción de la lección ejecutada"),
    onFavorito: () => alert("Favorito presionado"),
  },
};

export const EnProgreso: Story = {
  args: {
    ...Playground.args,
    estado: "enProgreso",
    titulo: "El Nacimiento de Jesús",
    senda: "Senda del Hijo",
    progreso: 60,
  },
};

export const Completada: Story = {
  args: {
    ...Playground.args,
    estado: "completada",
    titulo: "El Fruto del Espíritu",
    senda: "Senda del Espíritu Santo",
    progreso: 100,
  },
};

export const DescargadaOffline: Story = {
  args: {
    ...Playground.args,
    estado: "descargada",
    titulo: "David y Goliat",
    senda: "Senda del Padre",
  },
};

export const Bloqueada: Story = {
  args: {
    ...Playground.args,
    estado: "bloqueada",
    titulo: "La Promesa a Abraham",
    senda: "Senda del Padre",
  },
};

export const ErrorConexion: Story = {
  args: {
    ...Playground.args,
    estado: "error",
    titulo: "El Arca de Noé",
    senda: "Senda del Padre",
  },
};
