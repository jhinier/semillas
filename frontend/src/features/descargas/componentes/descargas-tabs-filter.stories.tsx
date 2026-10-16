import type { Meta, StoryObj } from "@storybook/react-vite";
import { DescargasTabsFilter } from "./descargas-tabs-filter";
import "@/routes/app-descargas.css";

const meta = {
  title: "Features/Descargas/DescargasTabsFilter",
  component: DescargasTabsFilter,
  tags: ["autodocs"],
  args: {
    activeTab: "todos",
    onTabChange: () => undefined,
    counts: { total: 6, descargados: 2, disponibles: 4, actualizaciones: 1 },
    sortOrder: "recientes",
    onSortChange: () => undefined,
    searchQuery: "",
    onSearchChange: () => undefined,
  },
} satisfies Meta<typeof DescargasTabsFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
