import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alerta } from "./alerta";

const meta = {
  title: "Componentes/Estado/Alerta",
  component: Alerta,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  argTypes: {
    variante: {
      control: "select",
      options: ["exito", "atencion", "error", "informacion", "offline"]
    }
  }
} satisfies Meta<typeof Alerta>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Informacion: Story = {
  args: {
    variante: "informacion",
    children: "Tu progreso se guardará automáticamente cuando vuelvas a estar en línea."
  }
};

export const Exito: Story = {
  args: {
    variante: "exito",
    children: "Lección completada. Se sumaron 20 XP a tu cuenta."
  }
};

export const Atencion: Story = {
  args: {
    variante: "atencion",
    children: "Revisa tus respuestas antes de continuar al siguiente paso."
  }
};

export const Error: Story = {
  args: {
    variante: "error",
    children: "No se pudo guardar tu avance. Intenta de nuevo."
  }
};

export const Offline: Story = {
  args: {
    variante: "offline",
    children: "Estás sin conexión. El contenido descargado sigue disponible."
  }
};

export const Comparativa: Story = {
  parameters: {
    layout: "fullscreen"
  },
  render: () => (
    <div className="min-h-screen bg-[#F7F4EC] p-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <Alerta variante="informacion">Tu perfil está listo para sincronizar.</Alerta>
        <Alerta variante="offline">Modo offline activo. Los cambios quedan pendientes.</Alerta>
        <Alerta variante="atencion">Falta responder una pregunta para avanzar.</Alerta>
        <Alerta variante="exito">Has desbloqueado una nueva insignia.</Alerta>
        <Alerta variante="error">Error de red al guardar el progreso.</Alerta>
      </div>
    </div>
  )
};
