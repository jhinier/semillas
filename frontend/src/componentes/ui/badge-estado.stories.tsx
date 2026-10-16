import type { Meta, StoryObj } from "@storybook/react-vite";
import { BadgeEstado } from "./badge-estado";

const meta = {
  title: "Componentes/BadgeEstado",
  component: BadgeEstado,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BadgeEstado>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Publicado: Story = {
  args: {
    estado: "publicado",
  },
};

export const EnRevision: Story = {
  args: {
    estado: "en revisión",
  },
};

export const Revision: Story = {
  args: {
    estado: "revision",
  },
};

export const Borrador: Story = {
  args: {
    estado: "borrador",
  },
};

export const Archivada: Story = {
  args: {
    estado: "archivado",
  },
};

export const Personalizado: Story = {
  args: {
    estado: "custom",
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
        <h1 className="mb-6 text-3xl font-extrabold text-slate-900">BadgeEstado</h1>
        <p className="mb-8 text-slate-500">
          Badges para mostrar el estado de contenido en el sistema: publicado, en revisión, borrador o archivado.
        </p>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">Estados disponibles</h2>
          <div className="flex flex-wrap gap-3">
            <div className="text-center">
              <BadgeEstado estado="publicado" />
              <p className="text-xs text-slate-400 mt-2">publicado</p>
            </div>
            <div className="text-center">
              <BadgeEstado estado="en revisión" />
              <p className="text-xs text-slate-400 mt-2">en revisión</p>
            </div>
            <div className="text-center">
              <BadgeEstado estado="borrador" />
              <p className="text-xs text-slate-400 mt-2">borrador</p>
            </div>
            <div className="text-center">
              <BadgeEstado estado="archivado" />
              <p className="text-xs text-slate-400 mt-2">archivado</p>
            </div>
            <div className="text-center">
              <BadgeEstado estado="personalizado" />
              <p className="text-xs text-slate-400 mt-2">personalizado</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">En tablas</h2>
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">Tema</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3">La gracia de Dios</td>
                  <td className="px-4 py-3"><BadgeEstado estado="publicado" /></td>
                </tr>
                <tr>
                  <td className="px-4 py-3">El amor del Padre</td>
                  <td className="px-4 py-3"><BadgeEstado estado="en revisión" /></td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Espíritu Santo guía</td>
                  <td className="px-4 py-3"><BadgeEstado estado="borrador" /></td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Antiguo testamento</td>
                  <td className="px-4 py-3"><BadgeEstado estado="archivado" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  ),
};
