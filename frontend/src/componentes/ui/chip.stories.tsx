import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { ArrowRight, Flame, Lock, Shield, Sprout, Star } from "lucide-react";
import { Chip, Badge, CampanaBadge } from "./chip";

const meta = {
  title: "Componentes/Chip y Badge",
  component: Chip,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

// ── Stories de Chip ──────────────────────────────────────────────────────────

export const PorDefecto: Story = {
  args: {
    children: "Senda del Padre",
    color: "azul",
    icono: <ArrowRight />,
  },
};

export const SendaPadre: Story = {
  args: {
    children: "Senda del Padre",
    color: "azul",
    icono: <ArrowRight />,
  },
};

export const SendaHijo: Story = {
  args: {
    children: "Senda del Hijo",
    color: "morado",
    icono: <ArrowRight />,
  },
};

export const SendaEspiritu: Story = {
  args: {
    children: "Espíritu Santo",
    color: "naranja",
    icono: <Flame />,
  },
};

export const SemillasEdad: Story = {
  name: "Semillas (5-8)",
  args: {
    children: "Semillas (5-8)",
    color: "verde",
    icono: <Sprout />,
  },
};

export const BloqueadoChip: Story = {
  name: "Bloqueado",
  args: {
    children: "Bloqueado",
    color: "gris",
    icono: <Lock />,
  },
};

// ── Stories de Badge ─────────────────────────────────────────────────────────

export const BadgeNivel: StoryObj<typeof Badge> = {
  render: () => (
    <Badge color="morado" icono={<Shield />}>
      Nivel 7
    </Badge>
  ),
};

export const BadgeXP: StoryObj<typeof Badge> = {
  render: () => (
    <Badge color="amarillo" icono={<Star />}>
      +250 XP
    </Badge>
  ),
};

export const BadgeNotificationBell: StoryObj<typeof CampanaBadge> = {
  render: () => <CampanaBadge conteo={3} />,
};
