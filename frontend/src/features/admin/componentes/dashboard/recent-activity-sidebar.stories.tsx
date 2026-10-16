import type { Meta, StoryObj } from "@storybook/react-vite";
import { RecentActivitySidebar } from "./recent-activity-sidebar";

const meta = {
  title: "Admin/Dashboard/Recent Activity Sidebar",
  component: RecentActivitySidebar,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof RecentActivitySidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    actividades: [
      {
        id: "1",
        texto: 'Se publicó el tema "La creación de Dios" en la senda "Dios y su amor".',
        haceCuanto: "Hace 15 min",
        tipo: "tema",
      },
      {
        id: "2",
        texto: 'María López creó una nueva actividad "Construyendo la confianza".',
        haceCuanto: "Hace 1 h",
        tipo: "actividad",
      },
      {
        id: "3",
        texto: 'El Club "Semillitas de Luz" agregó 8 nuevos miembros.',
        haceCuanto: "Hace 3 h",
        tipo: "club",
      },
      {
        id: "4",
        texto: 'Se subió un nuevo recurso multimedia "Video: El Buen Samaritano".',
        haceCuanto: "Hace 5 h",
        tipo: "recurso",
      },
      {
        id: "5",
        texto: 'Juan Pérez aprobó el tema "La oración" para publicación.',
        haceCuanto: "Hace 1 día",
        tipo: "aprobacion",
      },
    ],
    onVerTodaLaActividad: () => alert("Ver toda la actividad"),
  },
};
