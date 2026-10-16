import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { BarraProgreso } from "./barra-progreso";
import { ProgresoCircular } from "./progreso-circular";
import { StepperCRECER } from "./stepper-crecer";

const meta = {
  title: "Componentes/Indicadores de Progreso",
  component: BarraProgreso,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof BarraProgreso>;

export default meta;

export const BarraLinealLeccion: StoryObj<typeof BarraProgreso> = {
  name: "Barra Lineal (Lección)",
  args: {
    valor: 60,
    etiqueta: "Progreso de lección",
    color: "morado",
  },
};

export const BarraLinealSenda: StoryObj<typeof BarraProgreso> = {
  name: "Barra Lineal (Senda)",
  args: {
    valor: 80,
    etiqueta: "Progreso de senda",
    color: "verde",
  },
};

export const BarraLinealDescargas: StoryObj<typeof BarraProgreso> = {
  name: "Barra Lineal (Descargas)",
  args: {
    valor: 12,
    maximo: 20,
    etiqueta: "Descargas offline",
    color: "naranja",
  },
};

export const CircularLecciones: StoryObj<typeof ProgresoCircular> = {
  name: "Circular (Lecciones)",
  render: () => (
    <div style={{ display: "flex", gap: "20px" }}>
      <ProgresoCircular porcentaje={75} etiqueta="Lecciones" color="morado" />
      <ProgresoCircular porcentaje={60} etiqueta="Senda" color="verde" />
      <ProgresoCircular porcentaje={30} etiqueta="Retos" color="naranja" />
    </div>
  ),
};

export const StepperMomento: StoryObj<typeof StepperCRECER> = {
  name: "Stepper CRECER",
  render: () => (
    <div style={{ maxWidth: "600px" }}>
      <StepperCRECER
        pasos={[
          { numero: 1, nombre: "Conectar", estado: "completado", colorHex: "#2E9E5B" },
          { numero: 2, nombre: "Relatar", estado: "completado", colorHex: "#3D8BD4" },
          { numero: 3, nombre: "Enseñar", estado: "completado", colorHex: "#6C3AED" },
          { numero: 4, nombre: "Comprobar", estado: "actual", colorHex: "#F4B740" },
          { numero: 5, nombre: "Experimentar", estado: "pendiente", colorHex: "#17A398" },
          { numero: 6, nombre: "Recompensar", estado: "pendiente", colorHex: "#EE6C4D" },
        ]}
      />
    </div>
  ),
};
