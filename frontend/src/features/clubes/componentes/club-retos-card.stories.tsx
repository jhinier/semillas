import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClubRetosCard } from "./club-retos-card";

const meta: Meta<typeof ClubRetosCard> = {
  title: "Features/Clubes/ClubRetosCard",
  component: ClubRetosCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    progresoPorcentaje: 72,
    metaActividades: 250,
    actualActividades: 180,
  },
};
