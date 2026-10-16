import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import {
  Star,
  BookOpen,
  Heart,
  Cloud,
  Zap,
  MessageCircle,
  Users,
  Award,
} from "lucide-react";
import { BloqueIconoTexto } from "./bloque-icono-texto";

const meta = {
  title: "Componentes/BloqueIconoTexto",
  component: BloqueIconoTexto,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BloqueIconoTexto>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Predeterminado: Story = {
  args: {
    icono: <Star className="size-5 text-amber-500" />,
    titulo: "Título del bloque",
    descripcion: "Descripción breve del contenido",
  },
};

export const SoloTitulo: Story = {
  args: {
    icono: <BookOpen className="size-5 text-blue-500" />,
    titulo: "Solo título sin descripción",
  },
};

export const ConIconosColoreados: Story = {
  args: {
    icono: <Heart className="size-5 text-red-500" />,
    titulo: "Amor",
    descripcion: "El amor de Dios es eterno",
  },
  render: () => (
    <div className="space-y-4 w-80">
      <BloqueIconoTexto
        icono={<Heart className="size-5 text-red-500" />}
        titulo="Amor"
        descripcion="El amor de Dios es eterno"
        iconoCajaClassName="bg-red-50"
      />
      <BloqueIconoTexto
        icono={<Cloud className="size-5 text-blue-500" />}
        titulo="Provisión"
        descripcion="Dios provee para nuestras necesidades"
        iconoCajaClassName="bg-blue-50"
      />
      <BloqueIconoTexto
        icono={<Zap className="size-5 text-yellow-500" />}
        titulo="Poder"
        descripcion="La fuerza del Espíritu Santo"
        iconoCajaClassName="bg-yellow-50"
      />
    </div>
  ),
};

export const DocumentacionCompleta: Story = {
  name: "📄 Documentación Completa",
  args: {
    icono: <Star className="size-5 text-amber-500" />,
    titulo: "Bloque de ejemplo",
    descripcion: "Componente con icono, título y descripción",
  },
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <div className="min-h-screen bg-white font-sans p-8">
      <div className="max-w-3xl">
        <h1 className="mb-6 text-3xl font-extrabold text-slate-900">BloqueIconoTexto</h1>
        <p className="mb-8 text-slate-500">
          Bloque que combina un icono dentro de un contenedor con título y descripción.
          Ideal para feature lists, beneficios y secciones informativas.
        </p>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">Variantes básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BloqueIconoTexto
              icono={<Star className="size-5 text-amber-500" />}
              titulo="Título característico"
              descripcion="Descripción breve del beneficio o característica"
              iconoCajaClassName="bg-amber-50"
            />
            <BloqueIconoTexto
              icono={<BookOpen className="size-5 text-blue-500" />}
              titulo="Aprendizaje continuo"
              descripcion="Contenido adaptado a cada edad"
              iconoCajaClassName="bg-blue-50"
            />
            <BloqueIconoTexto
              icono={<Heart className="size-5 text-red-500" />}
              titulo="Amor y fe"
              descripcion=" Valores cristianos para toda la vida"
              iconoCajaClassName="bg-red-50"
            />
            <BloqueIconoTexto
              icono={<Users className="size-5 text-green-500" />}
              titulo="Comunidad"
              descripcion="Aprende junto con otros niños"
              iconoCajaClassName="bg-green-50"
            />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">Con iconos del sistema</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <BloqueIconoTexto
              icono={<Zap className="size-5 text-violet-500" />}
              titulo="Rápido"
              iconoCajaClassName="bg-violet-50"
            />
            <BloqueIconoTexto
              icono={<MessageCircle className="size-5 text-cyan-500" />}
              titulo="Interactivo"
              iconoCajaClassName="bg-cyan-50"
            />
            <BloqueIconoTexto
              icono={<Award className="size-5 text-orange-500" />}
              titulo="Logros"
              iconoCajaClassName="bg-orange-50"
            />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">Tamaños de icono</h2>
          <div className="space-y-4">
            <BloqueIconoTexto
              icono={<Star className="size-8 text-amber-500" />}
              titulo="Icono grande"
              descripcion="size-8"
              iconoCajaClassName="bg-amber-50 h-14 w-14"
            />
            <BloqueIconoTexto
              icono={<Star className="size-5 text-amber-500" />}
              titulo="Icono normal"
              descripcion="size-5 (default)"
              iconoCajaClassName="bg-amber-50"
            />
            <BloqueIconoTexto
              icono={<Star className="size-3 text-amber-500" />}
              titulo="Icono pequeño"
              descripcion="size-3"
              iconoCajaClassName="bg-amber-50 h-8 w-8"
            />
          </div>
        </section>
      </div>
    </div>
  ),
};
