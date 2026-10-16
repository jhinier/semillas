import type { Meta, StoryObj } from "@storybook/react-vite";

import { RelacionarConceptos, type RelacionarConceptosProps } from "./RelacionarConceptos";

const meta = {
  title: "Actividades/RelacionarConceptos",
  component: RelacionarConceptos,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof RelacionarConceptos>;

export default meta;
type Story = StoryObj<typeof meta>;

const paresBasicos: RelacionarConceptosProps["pares"] = [
  { id: "noe", concepto: "Noe", relacion: "Construyo el arca", pista: "Dios lo cuido durante el diluvio." },
  { id: "david", concepto: "David", relacion: "Vencio a Goliat", pista: "Confio en Dios con una honda." },
  { id: "moises", concepto: "Moises", relacion: "Cruzo el Mar Rojo", pista: "Guio al pueblo de Israel." },
];

const paresMedios: RelacionarConceptosProps["pares"] = [
  ...paresBasicos,
  { id: "maria", concepto: "Maria", relacion: "Madre de Jesus", pista: "Recibio una visita del angel." },
  { id: "pablo", concepto: "Pablo", relacion: "Escribio cartas a las iglesias", pista: "Viajo anunciando el evangelio." },
];

const baseArgs: RelacionarConceptosProps = {
  pares: paresBasicos,
  titulo: "Relaciona cada personaje",
  descripcion: "Une cada personaje biblico con lo que hizo.",
  xp: 25,
  mostrarPistas: false,
};

export const BasicoMovil: Story = { args: { ...baseArgs } };
export const ConPistas: Story = { args: { ...baseArgs, mostrarPistas: true } };
export const DificultadMedia: Story = { args: { ...baseArgs, pares: paresMedios, xp: 40 } };
export const CompletadoDemo: Story = { args: { ...baseArgs, titulo: "Completa todos los pares" } };
export const DocumentacionCompleta: Story = {
  args: baseArgs,
  parameters: { layout: "fullscreen" },
  render: () => (
    <main className="min-h-screen bg-[#F7F4EC] p-4 text-[#123B2C] sm:p-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,440px)]">
        <section className="rounded-[2rem] bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2E9E5B]">Semillas UI</p>
          <h1 className="mt-2 text-4xl font-black leading-tight">Relacionar conceptos</h1>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#49695D]">
            Actividad para unir personajes, ideas o eventos biblicos con su significado mediante toque o drag/drop.
          </p>
          <pre className="mt-6 overflow-auto rounded-3xl bg-[#123B2C] p-5 text-sm font-semibold leading-6 text-[#F7F4EC]">
            {`{
  tipo: "RELACIONAR_CONCEPTOS",
  titulo: "Personajes y acciones",
  configuracion: {
    pares: [
      { id: "noe", concepto: "Noe", relacion: "Construyo el arca" }
    ],
    xp: 25
  }
}`}
          </pre>
        </section>
        <RelacionarConceptos {...baseArgs} mostrarPistas />
      </div>
    </main>
  ),
};
