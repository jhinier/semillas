import type { Meta, StoryObj } from "@storybook/react-vite";
import { AdminThemesHeader } from "./admin-themes-header";

const meta = {
  title: "Admin/Themes/Header",
  component: AdminThemesHeader,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof AdminThemesHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onCrearTema: () => alert("Crear tema click"),
  },
};
