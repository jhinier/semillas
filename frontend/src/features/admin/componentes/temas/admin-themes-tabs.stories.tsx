import type { Meta, StoryObj } from "@storybook/react-vite";
import { AdminThemesTabs } from "./admin-themes-tabs";

const meta = {
  title: "Admin/Themes/Tabs",
  component: AdminThemesTabs,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof AdminThemesTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activeTab: "todos",
    onTabChange: (t) => console.log("Tab cambiado:", t),
    counts: {
      todos: 100,
      borradores: 8,
      revision: 5,
      publicados: 87,
    },
  },
};
