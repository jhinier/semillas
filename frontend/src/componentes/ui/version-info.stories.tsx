import type { Meta, StoryObj } from "@storybook/react-vite";

import { VersionInfo } from "./version-info";

const meta = {
  title: "Componentes/Estado/VersionInfo",
  component: VersionInfo,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  argTypes: {
    versionApp: {
      control: "text"
    },
    entorno: {
      control: "select",
      options: ["desarrollo", "pruebas", "produccion"]
    },
    fechaCompilacion: {
      control: "text"
    }
  }
} satisfies Meta<typeof VersionInfo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Desarrollo: Story = {
  args: {
    versionApp: "1.3.0",
    entorno: "desarrollo",
    fechaCompilacion: "8 de julio de 2026"
  }
};

export const Pruebas: Story = {
  args: {
    versionApp: "1.3.0-beta.2",
    entorno: "pruebas",
    fechaCompilacion: "8 de julio de 2026"
  }
};

export const Produccion: Story = {
  args: {
    versionApp: "1.3.0",
    entorno: "produccion",
    fechaCompilacion: "8 de julio de 2026"
  }
};

export const Comparativa: Story = {
  parameters: {
    layout: "fullscreen"
  },
  render: () => (
    <div className="min-h-screen bg-[#F7F4EC] p-6">
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-3">
        <VersionInfo versionApp="1.3.0" entorno="desarrollo" fechaCompilacion="8 de julio de 2026" />
        <VersionInfo versionApp="1.3.0-beta.2" entorno="pruebas" fechaCompilacion="8 de julio de 2026" />
        <VersionInfo versionApp="1.3.0" entorno="produccion" fechaCompilacion="8 de julio de 2026" />
      </div>
    </div>
  )
};
