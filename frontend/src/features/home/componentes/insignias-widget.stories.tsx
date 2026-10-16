import type { Meta, StoryObj } from "@storybook/react-vite";
import { InsigniasWidget } from "./insignias-widget";
import in1Img from "@/assets/images/Ilustraciones/in1.webp";

const meta: Meta<typeof InsigniasWidget> = {
  title: "Features/Home/InsigniasWidget",
  component: InsigniasWidget,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    insignias: [],
  },
};

export const WithInsignias: Story = {
  args: {
    insignias: [
      { id: "1", nombre: "Primer paso", imagenUrl: in1Img },
    ],
  },
};
