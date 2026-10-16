import type { Meta, StoryObj } from "@storybook/react-vite";
import { RachaWidget } from "./racha-widget";

const meta: Meta<typeof RachaWidget> = {
  title: "Features/Home/RachaWidget",
  component: RachaWidget,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    diasRacha: 0,
  },
};

export const WithStreak: Story = {
  args: {
    diasRacha: 5,
  },
};
