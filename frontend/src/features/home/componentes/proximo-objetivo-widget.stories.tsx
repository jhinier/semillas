import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryRouter } from "@/storybook/story-router";
import { ProximoObjetivoWidget } from "./proximo-objetivo-widget";

const meta = {
  title: "Componentes/Home/ProximoObjetivoWidget",
  component: ProximoObjetivoWidget,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <StoryRouter initialPath="/app">
        <div className="max-w-md p-4"><Story /></div>
      </StoryRouter>
    ),
  ],
} satisfies Meta<typeof ProximoObjetivoWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UsuarioNuevo: Story = { args: { xpTotal: 0, totalInsignias: 0 } };
export const ConProgreso: Story = { args: { xpTotal: 420, totalInsignias: 3 } };
