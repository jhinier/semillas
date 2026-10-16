import type { Meta, StoryObj } from "@storybook/react-vite";
import { AdminThemesSummary } from "./admin-themes-summary";

const meta = {
  title: "Admin/Themes/Summary",
  component: AdminThemesSummary,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof AdminThemesSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    counts: {
      total: 100,
      publicados: 87,
      revision: 5,
      borradores: 8,
      archivados: 0,
    },
    onVerReportes: () => alert("Ver reportes de temas click"),
  },
};
