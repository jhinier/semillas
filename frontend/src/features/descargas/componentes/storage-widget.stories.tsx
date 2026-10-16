import type { Meta, StoryObj } from "@storybook/react-vite";
import { StorageWidget } from "./storage-widget";
import "@/routes/app-descargas.css";

const meta = {
  title: "Features/Descargas/StorageWidget",
  component: StorageWidget,
  tags: ["autodocs"],
  args: {
    usageBytes: 148_000_000,
    quotaBytes: 2_000_000_000,
    packageBytes: 82_000_000,
    percentage: 7,
    persisted: true,
    downloadedCount: 3,
    isOnline: true,
    pendingCount: 2,
    onGestionarClick: () => undefined,
    onSync: () => undefined,
    isSyncing: false,
  },
} satisfies Meta<typeof StorageWidget>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const SinProteccion: Story = { args: { persisted: false } };
export const SinConexion: Story = { args: { isOnline: false, pendingCount: 4 } };
