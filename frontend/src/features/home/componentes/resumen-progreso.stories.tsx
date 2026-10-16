import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResumenProgreso } from "./resumen-progreso";

const meta = {
  title: "Componentes/Home/ResumenProgreso",
  component: ResumenProgreso,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof ResumenProgreso>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    xpTotal: 1240,
    numeroNivel: 7,
    nombreNivel: "Explorador",
    totalInsignias: 3,
  },
};
