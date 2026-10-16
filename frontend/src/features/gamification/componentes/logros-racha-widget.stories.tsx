import type { Meta, StoryObj } from "@storybook/react-vite";
import { LogrosRachaWidget } from "./logros-racha-widget";

const meta: Meta<typeof LogrosRachaWidget> = {
  title: "Features/Gamification/LogrosRachaWidget",
  component: LogrosRachaWidget,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    dias: 3,
    mensaje: "¡Sigue así! Has estudiado 3 días seguidos.",
  },
};
