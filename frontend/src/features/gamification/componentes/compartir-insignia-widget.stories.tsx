import type { Meta, StoryObj } from "@storybook/react-vite";
import { CompartirInsigniaWidget } from "./compartir-insignia-widget";
import in1Img from "@/assets/images/Ilustraciones/in1.webp";

const meta: Meta<typeof CompartirInsigniaWidget> = {
  title: "Features/Gamification/CompartirInsigniaWidget",
  component: CompartirInsigniaWidget,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    nombreInsignia: "Primer paso",
    imagenInsignia: in1Img,
    onCompartir: () => console.log("Compartir clicked"),
    compartido: false,
  },
};
export const Compartido: Story = {
  args: {
    nombreInsignia: "Primer paso",
    imagenInsignia: in1Img,
    onCompartir: () => console.log("Compartir clicked"),
    compartido: true,
  },
};
