import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContentStatusGrid } from "./content-status-grid";

const meta = {
  title: "Admin/Dashboard/Content Status Grid",
  component: ContentStatusGrid,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof ContentStatusGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    borradores: 42,
    enRevision: 18,
    publicados: 128,
    archivados: 14,
  },
};
