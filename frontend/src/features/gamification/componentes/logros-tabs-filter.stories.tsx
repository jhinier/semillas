import type { Meta, StoryObj } from "@storybook/react-vite";
import { LogrosTabsFilter } from "./logros-tabs-filter";

const meta: Meta<typeof LogrosTabsFilter> = {
  title: "Features/Gamification/LogrosTabsFilter",
  component: LogrosTabsFilter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const totales = { total: 3, obtenidas: 1, pendientes: 2 };

export const Todas: Story = {
  args: {
    activo: "todas",
    totales,
    onChange: (tab) => console.log("Category changed to", tab),
  },
};

export const Pendientes: Story = {
  args: {
    activo: "pendientes",
    totales,
    onChange: (tab) => console.log("Category changed to", tab),
  },
};
