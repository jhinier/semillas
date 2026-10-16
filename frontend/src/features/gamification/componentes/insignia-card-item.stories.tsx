import type { Meta, StoryObj } from "@storybook/react-vite";
import { InsigniaCardItem } from "./insignia-card-item";
import in1Img from "@/assets/images/Ilustraciones/in1.webp";

const meta: Meta<typeof InsigniaCardItem> = {
  title: "Features/Gamification/InsigniaCardItem",
  component: InsigniaCardItem,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Obtenida: Story = {
  args: {
    codigo: "primera_leccion",
    nombre: "Primer paso",
    descripcion: "Completaste tu primera lección.",
    criterio: "Completa 1 tema",
    bono_xp: 20,
    imagen: in1Img,
    obtenido: true,
  },
};

export const Bloqueada: Story = {
  args: {
    codigo: "explorador_palabra",
    nombre: "Explorador de la Fe",
    descripcion: "Completa 10 actividades en total.",
    criterio: "Completa 10 actividades",
    bono_xp: 50,
    imagen: in1Img,
    obtenido: false,
  },
};
