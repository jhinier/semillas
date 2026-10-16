import type { Meta, StoryObj } from "@storybook/react-vite";
import { RecentThemesTable } from "./recent-themes-table";

const meta = {
  title: "Admin/Dashboard/Recent Themes Table",
  component: RecentThemesTable,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof RecentThemesTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    temas: [
      {
        id: "1",
        titulo: "La creación de Dios",
        senda: "Dios y su amor",
        estado: "Publicado",
        editorNombre: "María López",
        editorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Maria",
        fechaEdicion: "15 may. 2024, 10:30",
      },
      {
        id: "2",
        titulo: "La oración",
        senda: "Vida con Jesús",
        estado: "En revisión",
        editorNombre: "Juan Pérez",
        editorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Juan",
        fechaEdicion: "14 may. 2024, 16:45",
      },
      {
        id: "3",
        titulo: "El perdón",
        senda: "Relaciones sanas",
        estado: "Borrador",
        editorNombre: "Ana Torres",
        editorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Ana",
        fechaEdicion: "13 may. 2024, 09:20",
      },
      {
        id: "4",
        titulo: "El Buen Samaritano",
        senda: "Amor al prójimo",
        estado: "Publicado",
        editorNombre: "Luis García",
        editorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Luis",
        fechaEdicion: "12 may. 2024, 11:05",
      },
      {
        id: "5",
        titulo: "Daniel en el foso de los leones",
        senda: "Fe y valentía",
        estado: "Publicado",
        editorNombre: "María López",
        editorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Maria",
        fechaEdicion: "11 may. 2024, 08:50",
      },
    ],
    onVerTodos: () => alert("Ver todos los temas"),
    onEditarTema: (id) => alert(`Editar tema con id: ${id}`),
  },
};
