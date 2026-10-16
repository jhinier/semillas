import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoginHeroPanel } from "./login-hero-panel";

const meta: Meta<typeof LoginHeroPanel> = {
  title: "Features/Auth/LoginHeroPanel",
  component: LoginHeroPanel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
