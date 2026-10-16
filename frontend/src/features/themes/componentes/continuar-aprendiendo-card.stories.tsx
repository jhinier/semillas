import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContinuarAprendiendoCard } from "./continuar-aprendiendo-card";

const meta: Meta<typeof ContinuarAprendiendoCard> = {
  title: "Features/Themes/ContinuarAprendiendoCard",
  component: ContinuarAprendiendoCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SinTema: Story = {
  args: {
    tema: null,
    onContinuar: () => console.log("Continuar clicked"),
  },
};

export const ConTema: Story = {
  args: {
    tema: {
      id: "1",
      titulo: "La creación del mundo",
      descripcion: "Aprende cómo Dios creó los cielos y la tierra.",
      senda: "Senda del Padre",
      duracion: "10 min",
      xp: 100,
      progreso: 50,
      favorito: true,
      imagenUrl: null,
      estado: "enProgreso",
    },
    onContinuar: () => console.log("Continuar clicked"),
  },
};
