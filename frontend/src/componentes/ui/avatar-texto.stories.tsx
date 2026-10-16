import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { AvatarTexto } from "./avatar-texto";

const meta = {
  title: "Componentes/AvatarTexto",
  component: AvatarTexto,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AvatarTexto>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Predeterminado: Story = {
  args: {
    src: "https://i.pravatar.cc/150?img=32",
    alt: "Foto de usuario",
    titulo: "María García",
    subtitulo: "maria.garcia@email.com",
  },
};

export const SoloImagen: Story = {
  args: {
    src: "https://i.pravatar.cc/150?img=12",
    alt: "Foto de usuario",
    titulo: "Carlos López",
  },
};

export const SoloTitulo: Story = {
  args: {
    src: "https://i.pravatar.cc/150?img=25",
    alt: "Foto de usuario",
    titulo: "Ana Martínez",
  },
};

export const TamanoPequeno: Story = {
  args: {
    src: "https://i.pravatar.cc/150?img=8",
    alt: "Avatar pequeño",
    titulo: "Pedro",
    subtitulo: "12 años",
    avatarClassName: "w-8 h-8",
  },
};

export const TamanoGrande: Story = {
  args: {
    src: "https://i.pravatar.cc/150?img=48",
    alt: "Avatar grande",
    titulo: "Familia Rodríguez",
    subtitulo: "4 miembros",
    avatarClassName: "w-20 h-20",
  },
};

export const DocumentacionCompleta: StoryObj = {
  name: "📄 Documentación Completa",
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <div className="min-h-screen bg-white font-sans">
      <aside className="w-full border-b border-slate-100 bg-white p-6 max-w-xs">
        <h1 className="mb-2 text-2xl font-extrabold text-slate-900">Avatar con Texto</h1>
        <p className="text-sm text-slate-500">
          Componente que combina una imagen de avatar con textos de título y subtítulo.
          Comúnmente usado en listas de usuarios, comentarios y perfiles.
        </p>
      </aside>
      <main className="p-8 space-y-8">
        <section>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">Variantes</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-xl">
              <p className="text-xs text-slate-400 mb-3">Predeterminado (título + subtítulo)</p>
              <AvatarTexto
                src="https://i.pravatar.cc/150?img=32"
                alt="Usuario"
                titulo="María García"
                subtitulo="maria.garcia@email.com"
              />
            </div>
            <div className="p-4 border rounded-xl">
              <p className="text-xs text-slate-400 mb-3">Solo título</p>
              <AvatarTexto
                src="https://i.pravatar.cc/150?img=25"
                alt="Usuario"
                titulo="Ana Martínez"
              />
            </div>
            <div className="p-4 border rounded-xl">
              <p className="text-xs text-slate-400 mb-3">Con tamaño personalizado</p>
              <AvatarTexto
                src="https://i.pravatar.cc/150?img=48"
                alt="Usuario"
                titulo="Familia Rodríguez"
                subtitulo="4 miembros"
                avatarClassName="w-16 h-16"
              />
            </div>
          </div>
        </section>
        <section>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">En contexto de lista</h2>
          <div className="space-y-2 max-w-md">
            {[
              { img: 32, nombre: "María García", email: "maria.garcia@email.com" },
              { img: 12, nombre: "Carlos López", email: "carlos.lopez@email.com" },
              { img: 8, nombre: "Pedro Fernández", email: "pedro.f@email.com" },
            ].map((u, i) => (
              <div key={i} className="p-3 border rounded-xl flex items-center gap-3">
                <AvatarTexto
                  src={`https://i.pravatar.cc/150?img=${u.img}`}
                  alt={u.nombre}
                  titulo={u.nombre}
                  subtitulo={u.email}
                  avatarClassName="w-10 h-10"
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  ),
};
