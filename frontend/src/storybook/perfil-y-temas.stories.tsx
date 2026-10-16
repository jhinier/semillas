import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { BookOpen, Flame, LogOut, Settings, Star } from "lucide-react";
import { ActionButton } from "@/features/perfil/componentes/ActionButton";
import { Item } from "@/features/perfil/componentes/Item";
import { MetricCard } from "@/features/perfil/componentes/MetricCard";
import { SendaFilterRow } from "@/features/themes/componentes/senda-filter-row";
import { TemasEmptyState, TemasErrorState, TemasLoadingState } from "@/features/themes/componentes/temas-page-states";

function PerfilCatalogo() {
  const [senda, setSenda] = useState<"padre" | "hijo" | "espiritu" | undefined>(undefined);
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-5 p-3 sm:p-8">
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard icon={Star} label="XP total" value="2.480" helper="+180 esta semana" accent="text-violet-600" />
        <MetricCard icon={Flame} label="Racha" value="12 días" helper="Tu mejor marca" accent="text-orange-600" />
        <MetricCard icon={BookOpen} label="Temas" value="18" helper="7 completados" accent="text-emerald-600" />
      </div>
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <Item label="Apodo" value="Luz" />
        <Item label="Grupo" value="Exploradores" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ActionButton icon={Settings} label="Configurar perfil" onClick={() => undefined} />
          <ActionButton icon={LogOut} label="Cerrar sesión" onClick={() => undefined} />
        </div>
      </div>
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <SendaFilterRow searchSenda={senda} onSendaChange={(value) => setSenda(value === "todas" ? undefined : value)} />
      </div>
    </div>
  );
}

const meta = {
  title: "Features/Perfil y temas/Catálogo",
  component: PerfilCatalogo,
  parameters: { layout: "fullscreen" },
  globals: { backgrounds: { value: "grisApp", grid: false } },
} satisfies Meta<typeof PerfilCatalogo>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
export const EstadosDeTemas: Story = {
  render: () => <div className="grid min-h-screen gap-4 bg-slate-50 p-4"><TemasLoadingState /><TemasErrorState /><TemasEmptyState /></div>,
};
