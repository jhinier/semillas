import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResumenTemasCard } from "./resumen-temas-card";

const meta: Meta<typeof ResumenTemasCard> = {
  title: "Features/Themes/ResumenTemasCard",
  component: ResumenTemasCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    totales: 10,
    completados: 4,
    enProgreso: 2,
  },
};
