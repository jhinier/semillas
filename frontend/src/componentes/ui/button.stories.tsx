import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "./button";

const meta = {
  title: "Componentes/Button (shadcn/ui)",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "responsive", "icon", "icon-responsive", "icon-sm", "icon-lg"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destructive",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
    children: "Link",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large",
  },
};

export const Icon: Story = {
  args: {
    size: "icon",
    children: <Mail className="size-4" />,
    "aria-label": "Enviar correo",
  },
};

export const Cargando: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="size-4 animate-spin" />
        Procesando...
      </>
    ),
  },
};

export const DocumentacionCompleta: Story = {
  name: "📄 Documentación Completa",
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <div className="min-h-screen bg-white font-sans p-8">
      <div className="max-w-3xl">
        <h1 className="mb-6 text-3xl font-extrabold text-slate-900">Button (shadcn/ui)</h1>
        <p className="mb-8 text-slate-500">
          Componente Button base de shadcn/ui con variantes de color y tamaño.
          Usado como base para construir botones personalizados.
        </p>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">Variantes</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">Tamaños</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Icono"><Mail className="size-4" /></Button>
            <Button size="icon-sm" aria-label="Icono pequeño"><Mail className="size-3" /></Button>
            <Button size="icon-lg" aria-label="Icono grande"><Mail className="size-5" /></Button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">Con iconos</h2>
          <div className="flex flex-wrap gap-3">
            <Button>
              <Mail className="size-4" />
              Enviar correo
            </Button>
            <Button variant="outline">
              Continuar
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="secondary">
              <Loader2 className="size-4 animate-spin" />
              Cargando
            </Button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">Estados</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Normal</Button>
            <Button disabled>Deshabilitado</Button>
            <Button>
              <Loader2 className="size-4 animate-spin" />
              Cargando
            </Button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">CVA buttonVariants</h2>
          <div className="p-4 bg-slate-50 rounded-xl font-mono text-xs">
            <pre>{`buttonVariants({
  variant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link",
  size: "default" | "sm" | "lg" | "responsive" | "icon" | "icon-responsive" | "icon-sm" | "icon-lg"
})`}</pre>
          </div>
        </section>
      </div>
    </div>
  ),
};
