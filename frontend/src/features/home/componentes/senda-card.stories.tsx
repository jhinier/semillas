import type { Meta, StoryObj } from "@storybook/react-vite";
import { SendaCard } from "./senda-card";
import sendaPadreImg from "@/assets/images/Ilustraciones/Senda del Padre.webp";

const meta: Meta<typeof SendaCard> = {
  title: "Features/Home/SendaCard",
  component: SendaCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Padre: Story = {
  args: {
    variante: "padre",
    imagenUrl: sendaPadreImg,
    label: "Senda del",
    titulo: "Padre",
    descripcion: "Dios es nuestro Padre amoroso.",
    hash: "padre",
  },
};
