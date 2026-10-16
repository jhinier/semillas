import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClubLogrosCard } from "./club-logros-card";

const meta: Meta<typeof ClubLogrosCard> = {
  title: "Features/Clubes/ClubLogrosCard",
  component: ClubLogrosCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    logros: [
      {
        id: "1",
        codigo: "raices_firmes",
        nombre: "Raíces firmes",
        descripcion: "Completa 100 actividades como club.",
        tipoIcono: "shield",
        completado: true,
      },
      {
        id: "2",
        codigo: "luz_mundo",
        nombre: "Luz del mundo",
        descripcion: "Completa 250 actividades como club.",
        tipoIcono: "flame",
        completado: false,
        progresoActual: 180,
        progresoMeta: 250,
      },
      {
        id: "3",
        codigo: "un_solo_corazon",
        nombre: "Un solo corazón",
        descripcion: "Participa juntos durante 7 días seguidos.",
        tipoIcono: "heart",
        completado: false,
        progresoActual: 5,
        progresoMeta: 7,
      },
    ],
    onVerTodos: () => console.log("Ver todos clicked"),
  },
};
