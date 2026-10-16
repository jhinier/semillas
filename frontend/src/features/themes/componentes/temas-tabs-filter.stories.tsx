import type { Meta, StoryObj } from "@storybook/react-vite";
import { TemasTabsFilter } from "./temas-tabs-filter";

const meta: Meta<typeof TemasTabsFilter> = {
  title: "Features/Themes/TemasTabsFilter",
  component: TemasTabsFilter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Todos: Story = {
  args: {
    activo: "todos",
    onChange: (tab) => console.log("Tab changed to", tab),
  },
};
export const Completados: Story = {
  args: {
    activo: "completados",
    onChange: (tab) => console.log("Tab changed to", tab),
  },
};
