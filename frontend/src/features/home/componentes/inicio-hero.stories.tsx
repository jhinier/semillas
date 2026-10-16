import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryRouter } from "@/storybook/story-router";
import { InicioHero } from "./inicio-hero";

const meta = {
  title: "Componentes/Home/InicioHero",
  component: InicioHero,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof InicioHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    imagenUrl: "https://picsum.photos/seed/semillasbanner/800/250",
    nombreUsuario: "Andres",
  },
  render: (args) => (
    <StoryRouter initialPath="/app">
      <div className="p-4">
        <InicioHero {...args} />
      </div>
    </StoryRouter>
  ),
};
