import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClubRetoSemanalWidget } from "./club-reto-semanal-widget";

const meta: Meta<typeof ClubRetoSemanalWidget> = {
  title: "Features/Clubes/ClubRetoSemanalWidget",
  component: ClubRetoSemanalWidget,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    completadas: 12,
    meta: 20,
  },
};
