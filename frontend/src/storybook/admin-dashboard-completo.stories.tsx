import type { Meta, StoryObj } from "@storybook/react-vite";
import { PanelAdministracion } from "@/features/admin/componentes/dashboard/panel-admin";
import { StoryRouter } from "./story-router";

function DashboardAdmin() {
  return (
    <StoryRouter initialPath="/admin">
      <div className="min-h-screen bg-slate-50 p-3 sm:p-8"><PanelAdministracion /></div>
    </StoryRouter>
  );
}

const meta = {
  title: "Pantallas/Administración/Dashboard",
  component: DashboardAdmin,
  parameters: { layout: "fullscreen" },
  globals: { backgrounds: { value: "grisApp", grid: false } },
} satisfies Meta<typeof DashboardAdmin>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
