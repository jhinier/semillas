import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProgresoXpWidget } from "./progreso-xp-widget";
import "@/routes/app-logros.css";

const meta: Meta<typeof ProgresoXpWidget> = {
  title: "Features/Gamification/ProgresoXpWidget",
  component: ProgresoXpWidget,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    xpTotal: 80,
    numNivel: 1,
    nombreNivel: "Brote",
    xpRestantes: 20,
    porcentaje: 80,
    nombreSiguienteNivel: "Raíz",
    onVerDetalles: () => console.log("Ver perfil clicked"),
  },
};

export const NivelMaximo: Story = {
  args: {
    xpTotal: 3200,
    numNivel: 7,
    nombreNivel: "Explorador",
    xpRestantes: 0,
    porcentaje: 100,
    esNivelMaximo: true,
  },
};
