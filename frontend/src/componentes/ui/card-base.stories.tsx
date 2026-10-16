import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card-base";

const meta = {
  title: "Componentes/Card/Base",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    sombra: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Tamaño de la sombra de la tarjeta",
    },
    hoverEffect: {
      control: "select",
      options: ["none", "elevate"],
      description: "Efecto interactivo al pasar el mouse",
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Principal: Story = {
  args: {
    sombra: "sm",
    hoverEffect: "elevate",
    className: "w-[320px]",
    children: (
      <>
        <CardHeader>
          <CardTitle>Título de la Tarjeta</CardTitle>
          <CardDescription>Descripción corta o subtítulo</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">Este es el cuerpo principal de la tarjeta base. Permite inyectar cualquier elemento JSX de manera flexible.</p>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t border-slate-50 pt-4 mt-2">
          <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">Cancelar</button>
          <button className="px-3 py-1.5 bg-[#2E9E5B] text-white rounded-lg text-xs font-semibold hover:bg-[#1E6B3C] transition-colors">Confirmar</button>
        </CardFooter>
      </>
    )
  }
};
