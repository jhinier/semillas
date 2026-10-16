import type { Meta, StoryObj } from "@storybook/react-vite";
import { BadgeEstadoUsuario } from "./badge-estado-usuario";

const meta = {
  title: "Componentes/BadgeEstadoUsuario",
  component: BadgeEstadoUsuario,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BadgeEstadoUsuario>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Activo: Story = {
  args: {
    estado: "activo",
  },
};

export const Pendiente: Story = {
  args: {
    estado: "pendiente",
  },
};

export const Bloqueado: Story = {
  args: {
    estado: "bloqueado",
  },
};

export const DocumentacionCompleta: StoryObj = {
  name: "📄 Documentación Completa",
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <div className="min-h-screen bg-white font-sans p-8">
      <div className="max-w-2xl">
        <h1 className="mb-6 text-3xl font-extrabold text-slate-900">BadgeEstadoUsuario</h1>
        <p className="mb-8 text-slate-500">
          Indica el estado de conexión o actividad de un usuario: activo, pendiente o bloqueado.
        </p>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">Estados</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-xl">
              <BadgeEstadoUsuario estado="activo" />
              <span className="text-sm text-slate-600">Usuario activo y conectado</span>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-xl">
              <BadgeEstadoUsuario estado="pendiente" />
              <span className="text-sm text-slate-600">Usuario pendiente de verificación</span>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-xl">
              <BadgeEstadoUsuario estado="bloqueado" />
              <span className="text-sm text-slate-600">Usuario bloqueado</span>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">En lista de usuarios</h2>
          <div className="border rounded-xl divide-y divide-slate-100">
            {[
              { nombre: "María García", estado: "activo" as const },
              { nombre: "Carlos López", estado: "pendiente" as const },
              { nombre: "Ana Martínez", estado: "activo" as const },
              { nombre: "Pedro Fernández", estado: "bloqueado" as const },
            ].map((u, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-slate-700">{u.nombre}</span>
                <BadgeEstadoUsuario estado={u.estado} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  ),
};
