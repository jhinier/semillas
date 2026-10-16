import type { Meta, StoryObj } from "@storybook/react-vite";
import { RecursoCard } from "./recurso-card";
import arkImg from "@/assets/images/Ilustraciones/Tema1.webp";
import "@/routes/app-descargas.css";

const temaBase = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  titulo: "El Amor de Dios",
  descripcion: "Un recorrido para aprender que el amor de Dios es grande, fiel y cercano.",
  imagenUrl: arkImg,
  senda: "Senda del Padre",
  color: "#d68b13",
  minutos: 20,
  xp: 150,
  version: 1,
  descargado: false,
  actualizacionDisponible: false,
  tamanoBytes: null,
  pasos: null,
  actividades: null,
  medios: null,
  descargadoEn: null,
  progresoDescarga: null,
  errorDescarga: null,
};

const meta = {
  title: "Features/Descargas/RecursoCard",
  component: RecursoCard,
  tags: ["autodocs"],
  args: {
    tema: temaBase,
    isOnline: true,
    onDownload: () => undefined,
    onDelete: () => undefined,
  },
} satisfies Meta<typeof RecursoCard>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Disponible: Story = {};
export const Descargando: Story = { args: { tema: { ...temaBase, progresoDescarga: 46 } } };
export const Descargado: Story = {
  args: {
    tema: {
      ...temaBase,
      descargado: true,
      tamanoBytes: 18_200_000,
      pasos: 6,
      actividades: 9,
      medios: 14,
      descargadoEn: new Date().toISOString(),
    },
  },
};
export const Actualizacion: Story = {
  args: {
    tema: {
      ...temaBase,
      descargado: true,
      actualizacionDisponible: true,
      tamanoBytes: 18_200_000,
      medios: 14,
      descargadoEn: new Date().toISOString(),
    },
  },
};
export const SinConexion: Story = { args: { isOnline: false } };
