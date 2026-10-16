import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TablaRanking, type MiembroRanking } from "@/features/clubes/componentes/tabla-ranking";
import { TarjetaClub } from "@/features/clubes/componentes/tarjeta-club";

const miembros: MiembroRanking[] = [
  { posicion: 1, nombre: "Mía", nivel: "Semilla luminosa", xpSemana: 1480, contribuciones: 18, avatarIndex: "1" },
  { posicion: 2, nombre: "Mateo", nivel: "Explorador", xpSemana: 1270, contribuciones: 15, avatarIndex: "3" },
  { posicion: 3, nombre: "Sara", nivel: "Embajadora", xpSemana: 1110, contribuciones: 12, avatarIndex: "6" },
  { posicion: 4, nombre: "Samuel", nivel: "Semilla", xpSemana: 980, avatarIndex: "8" },
];

function ClubCompleto() {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 p-3 sm:p-8">
      <TarjetaClub
        nombre="Club Semillas Riobamba"
        descripcion="Una comunidad para crecer juntos en la Palabra y servir con alegría."
        codigoInvitacion="SEMILLA-24"
        miembros={24}
        copiado={copiado}
        onCopiarCodigo={() => setCopiado(true)}
        onCompartirCodigo={() => undefined}
        onInvitar={() => undefined}
        onEditar={() => undefined}
      />
      <TablaRanking miembros={miembros} onVerCompleto={() => undefined} />
    </div>
  );
}

const meta = {
  title: "Features/Clubes/Vista completa",
  component: ClubCompleto,
  parameters: { layout: "fullscreen" },
  globals: { backgrounds: { value: "grisApp", grid: false } },
} satisfies Meta<typeof ClubCompleto>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Escritorio: Story = {};
export const MovilApp: Story = {
  globals: { viewport: { value: "movilApp", isRotated: false } },
};
export const SinMiembros: Story = {
  render: () => <div className="mx-auto max-w-3xl p-4"><TablaRanking miembros={[]} /></div>,
};
