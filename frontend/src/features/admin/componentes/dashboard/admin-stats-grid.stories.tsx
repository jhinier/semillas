import type { Meta, StoryObj } from "@storybook/react-vite";
import { AdminStatsGrid } from "./admin-stats-grid";

const meta = {
  title: "Admin/Dashboard/Stats Grid",
  component: AdminStatsGrid,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof AdminStatsGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    temasPublicados: 128,
    usuariosActivos: 2845,
    actividadesCreadas: 362,
    clubesActivos: 156,
  },
};
