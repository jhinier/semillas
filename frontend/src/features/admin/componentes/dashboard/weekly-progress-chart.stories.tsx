import type { Meta, StoryObj } from "@storybook/react-vite";
import { WeeklyProgressChart } from "./weekly-progress-chart";

const meta = {
  title: "Admin/Dashboard/Weekly Progress Chart",
  component: WeeklyProgressChart,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof WeeklyProgressChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    datos: [
      { dia: "Lun", valor: 12 },
      { dia: "Mar", valor: 18 },
      { dia: "Mié", valor: 24 },
      { dia: "Jue", valor: 20 },
      { dia: "Vie", valor: 16 },
      { dia: "Sáb", valor: 14 },
      { dia: "Dom", valor: 10 },
    ],
    onPeriodoChange: (periodo) => console.log("Periodo cambiado a:", periodo),
  },
};
