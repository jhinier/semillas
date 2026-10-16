import type { Meta, StoryObj } from "@storybook/react-vite";

import conectar from "@/assets/images/Ilustraciones/Conectar.webp";
import sendaPadre from "@/assets/images/Ilustraciones/Senda del Padre.webp";
import tema1 from "@/assets/images/Ilustraciones/Tema1.webp";
import tema2 from "@/assets/images/Ilustraciones/Tema2.webp";

import { Rompecabezas, type RompecabezasProps } from "./Rompecabezas";

const meta = {
  title: "Actividades/Rompecabezas",
  component: Rompecabezas,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    imagen: { control: false, description: "URL o asset importado para dividir en piezas" },
    filas: { control: { type: "number", min: 1, max: 4, step: 1 } },
    columnas: { control: { type: "number", min: 1, max: 4, step: 1 } },
    mostrarVistaReferencia: { control: "boolean" },
  },
} satisfies Meta<typeof Rompecabezas>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs: RompecabezasProps = {
  imagen: tema1,
  filas: 3,
  columnas: 3,
  mostrarVistaReferencia: true,
};

const niveles: ReadonlyArray<readonly [string, string, string]> = [
  ["2x2", "Semillas 5-8", "Primer contacto, pocas piezas y bajo esfuerzo."],
  ["3x3", "Exploradores", "Dificultad recomendada para actividades normales."],
  ["4x4", "Reto", "Más concentración para usuarios con práctica."],
];

export const Facil2x2Movil: Story = {
  name: "Fácil 2x2 móvil",
  args: {
    ...baseArgs,
    imagen: conectar,
    filas: 2,
    columnas: 2,
  },
};

export const Normal3x3: Story = {
  args: baseArgs,
};

export const Dificil4x4: Story = {
  args: {
    ...baseArgs,
    imagen: tema2,
    filas: 4,
    columnas: 4,
  },
};

export const ConVistaReferencia: Story = {
  args: {
    ...baseArgs,
    imagen: sendaPadre,
    mostrarVistaReferencia: true,
  },
};

export const SinVistaReferencia: Story = {
  args: {
    ...baseArgs,
    imagen: sendaPadre,
    mostrarVistaReferencia: false,
  },
};

export const DocumentacionCompleta: Story = {
  name: "Documentación completa",
  args: baseArgs,
  parameters: { layout: "fullscreen" },
  render: () => (
    <main className="min-h-screen bg-[#F7F4EC] p-4 text-[#123B2C] sm:p-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,420px)]">
        <section className="rounded-[2rem] bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2E9E5B]">Semillas UI</p>
          <h1 className="mt-2 text-4xl font-black leading-tight">Rompecabezas móvil</h1>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#49695D]">
            Actividad de cuadrícula para niños. Divide una imagen con background-position y permite resolverla tocando o arrastrando piezas.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {niveles.map(([nivel, titulo, descripcion]) => (
              <article key={nivel} className="rounded-3xl border border-[#E5DEC9] bg-[#F7F4EC] p-4">
                <p className="text-2xl font-black text-[#2E9E5B]">{nivel}</p>
                <h2 className="mt-2 font-black">{titulo}</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#6E7F76]">{descripcion}</p>
              </article>
            ))}
          </div>

          <pre className="mt-6 overflow-auto rounded-3xl bg-[#123B2C] p-5 text-sm font-semibold leading-6 text-[#F7F4EC]">
            {`{
  tipo: "ROMPECABEZAS",
  configuracion: {
    imagen: "/actividades/arca-noe.png",
    filas: 3,
    columnas: 3,
    xp: 20
  }
}`}
          </pre>
        </section>

        <Rompecabezas {...baseArgs} />
      </div>
    </main>
  ),
};
