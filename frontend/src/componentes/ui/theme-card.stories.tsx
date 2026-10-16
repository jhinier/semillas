import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeCard, type ThemeCardProps } from "./theme-card";

const meta = {
  title: "Componentes/Card/Temas",
  component: ThemeCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variante: {
      control: "select",
      options: ["default", "compact"],
      description: "Densidad visual de la card",
    },
    estado: {
      control: "select",
      options: ["porDefecto", "enProgreso", "completada", "descargada", "bloqueada", "error"],
      description: "Estado visual y de interacción",
    },
    senda: {
      control: "text",
      description: "Nombre de la senda bíblica",
    },
    titulo: {
      control: "text",
      description: "Título principal del tema",
    },
    descripcion: {
      control: "text",
      description: "Descripción resumida del tema",
    },
    duracion: {
      control: "text",
      description: "Duración estimada del tema",
    },
    xp: {
      control: { type: "number", min: 10, max: 500, step: 10 },
      description: "XP asociado al tema",
    },
    progreso: {
      control: { type: "range", min: 0, max: 100, step: 5 },
      description: "Porcentaje de avance del tema",
    },
    favorito: {
      control: "boolean",
      description: "Marca visual de favorito",
    },
  },
} satisfies Meta<typeof ThemeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs: ThemeCardProps = {
  variante: "default",
  estado: "porDefecto",
  senda: "Senda del Padre",
  titulo: "La Creación del Mundo",
  descripcion: "Descubre cómo Dios creó los cielos y la tierra en seis días increíbles y descansó el séptimo.",
  duracion: "10 min",
  xp: 100,
  progreso: 0,
  favorito: false,
  clase: "w-[320px]",
  onAccion: () => {},
  onFavorito: () => {},
};

export const Playground: Story = {
  args: baseArgs,
};

export const Compacta: Story = {
  args: {
    ...baseArgs,
    variante: "compact",
    titulo: "David y Goliat",
    descripcion: "La valentía de David frente a un gigante en una card más densa para listados largos.",
  },
};

export const EnProgreso: Story = {
  args: {
    ...baseArgs,
    estado: "enProgreso",
    titulo: "El Nacimiento de Jesús",
    senda: "Senda del Hijo",
    progreso: 60,
  },
};

export const Completada: Story = {
  args: {
    ...baseArgs,
    estado: "completada",
    titulo: "El Fruto del Espíritu",
    senda: "Senda del Espíritu Santo",
    progreso: 100,
  },
};

export const DescargadaOffline: Story = {
  args: {
    ...baseArgs,
    estado: "descargada",
    titulo: "El Arca de Noé",
    senda: "Senda del Padre",
    progreso: 20,
  },
};

export const Bloqueada: Story = {
  args: {
    ...baseArgs,
    estado: "bloqueada",
    titulo: "La Promesa a Abraham",
    senda: "Senda del Padre",
  },
};

export const ErrorConexion: Story = {
  args: {
    ...baseArgs,
    estado: "error",
    titulo: "La Multiplicación de los Panes",
    senda: "Senda del Hijo",
  },
};
