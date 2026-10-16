import type { Meta, StoryObj } from "@storybook/react-vite";
import { BadgeRol, type TipoRol } from "./badge-rol";

const meta = {
  title: "Componentes/BadgeRol",
  component: BadgeRol,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BadgeRol>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Nino: Story = {
  args: {
    rol: "Niño",
  },
};

export const Adolescente: Story = {
  args: {
    rol: "Adolescente",
  },
};

export const PadreMadre: Story = {
  args: {
    rol: "Padre/Madre",
  },
};

export const Moderador: Story = {
  args: {
    rol: "Moderador",
  },
};

export const Administrador: Story = {
  args: {
    rol: "Administrador",
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
        <h1 className="mb-6 text-3xl font-extrabold text-slate-900">BadgeRol</h1>
        <p className="mb-8 text-slate-500">
          Identifica el rol de cada usuario en la plataforma. Los roles determinan los permisos y accesos.
        </p>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">Todos los roles</h2>
          <div className="flex flex-wrap gap-3">
            <BadgeRol rol="Niño" />
            <BadgeRol rol="Adolescente" />
            <BadgeRol rol="Padre/Madre" />
            <BadgeRol rol="Moderador" />
            <BadgeRol rol="Administrador" />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">Por edad</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-xl text-center">
              <BadgeRol rol="Niño" className="mb-2" />
              <p className="text-xs text-slate-500">5-8 años</p>
            </div>
            <div className="p-4 border rounded-xl text-center">
              <BadgeRol rol="Adolescente" className="mb-2" />
              <p className="text-xs text-slate-500">9-12 años</p>
            </div>
            <div className="p-4 border rounded-xl text-center">
              <BadgeRol rol="Padre/Madre" className="mb-2" />
              <p className="text-xs text-slate-500">Adultos</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-700">En tabla de usuarios</h2>
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">Usuario</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3">María (niña)</td>
                  <td className="px-4 py-3"><BadgeRol rol="Niño" /></td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Carlos (adolescente)</td>
                  <td className="px-4 py-3"><BadgeRol rol="Adolescente" /></td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Doña María</td>
                  <td className="px-4 py-3"><BadgeRol rol="Padre/Madre" /></td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Juanito</td>
                  <td className="px-4 py-3"><BadgeRol rol="Moderador" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  ),
};
