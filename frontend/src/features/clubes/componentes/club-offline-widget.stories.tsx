import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClubOfflineWidget } from "./club-offline-widget";
import cover1 from "@/assets/images/Ilustraciones/Tema1.webp";
import cover2 from "@/assets/images/Ilustraciones/Tema2.webp";
import cover3 from "@/assets/images/Ilustraciones/Tema3.webp";

const meta: Meta<typeof ClubOfflineWidget> = {
  title: "Features/Clubes/ClubOfflineWidget",
  component: ClubOfflineWidget,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    temasDescargadosCount: 3,
    covers: [cover1, cover2, cover3],
    onIrDescargas: () => console.log("Ir descargas clicked"),
  },
};
