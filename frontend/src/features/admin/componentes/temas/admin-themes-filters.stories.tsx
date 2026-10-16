import type { Meta, StoryObj } from "@storybook/react-vite";
import { AdminThemesFilters } from "./admin-themes-filters";

const meta = {
  title: "Admin/Themes/Filters",
  component: AdminThemesFilters,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof AdminThemesFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    searchValue: "",
    onSearchChange: (v) => console.log("Search:", v),
    selectedSendaId: "",
    onSendaChange: (s) => console.log("Senda:", s),
    selectedAgeGroupId: "",
    onAgeGroupChange: (g) => console.log("AgeGroup:", g),
    sendas: [
      { id: "1", nombre: "Dios el Padre" },
      { id: "2", nombre: "Jesucristo el Hijo" },
      { id: "3", nombre: "Espíritu Santo" },
    ],
    ageGroups: [
      { id: "1", nombre: "Semillas (5-8)" },
      { id: "2", nombre: "Exploradores (9-12)" },
      { id: "3", nombre: "Embajadores (13-17)" },
    ],
    onMasFiltros: () => alert("Filtros avanzados click"),
  },
};
