import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { BookOpen, Home, PlayCircle, Sprout, Trophy, UserRound } from "lucide-react";

import { BottomNav, type OpcionBottomNav } from "./bottom-nav";

const opcionesBase: OpcionBottomNav[] = [
  { id: "inicio", etiqueta: "Inicio", icono: <Home className="size-5" /> },
  { id: "sendas", etiqueta: "Sendas", icono: <BookOpen className="size-5" /> },
  { id: "jugar", etiqueta: "Jugar", icono: <PlayCircle className="size-5" /> },
  { id: "logros", etiqueta: "Logros", icono: <Trophy className="size-5" /> },
  { id: "perfil", etiqueta: "Perfil", icono: <UserRound className="size-5" /> }
];

const meta = {
  title: "Componentes/Navegación/BottomNav",
  component: BottomNav,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  argTypes: {
    activo: {
      control: "select",
      options: opcionesBase.map((opcion) => opcion.id)
    }
  }
} satisfies Meta<typeof BottomNav>;

export default meta;

type Story = StoryObj<typeof meta>;

function BottomNavPreview({ activoInicial }: { activoInicial: string }) {
  const [activo, setActivo] = React.useState(activoInicial);

  return (
    <div className="w-[390px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl">
      <div className="min-h-[220px] bg-[#F7F4EC] p-4 text-sm text-slate-700">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#2E9E5B] shadow-sm">
          <Sprout className="size-4" />
          Demo móvil
        </div>
        <p>La barra inferior mantiene la navegación principal siempre a mano.</p>
      </div>
      <BottomNav opciones={opcionesBase} activo={activo} onCambiar={setActivo} />
    </div>
  );
}

export const InicioActivo: Story = {
  args: {
    activo: "inicio",
    opciones: opcionesBase,
    onCambiar: () => undefined
  },
  render: () => <BottomNavPreview activoInicial="inicio" />
};

export const JugarActivo: Story = {
  args: {
    activo: "jugar",
    opciones: opcionesBase,
    onCambiar: () => undefined
  },
  render: () => <BottomNavPreview activoInicial="jugar" />
};

export const PerfilActivo: Story = {
  args: {
    activo: "perfil",
    opciones: opcionesBase,
    onCambiar: () => undefined
  },
  render: () => <BottomNavPreview activoInicial="perfil" />
};
