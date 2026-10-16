import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Activity, Clock, Trophy, Home, BookOpen, Users } from "lucide-react";
import { TabsLinea, PillsFiltros, TabsSegmentado, BottomNav } from "./navegacion-tabs";

const meta = {
  title: "Componentes/Navegación",
  component: TabsLinea,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof TabsLinea>;

export default meta;

export const TabsConLinea: StoryObj<typeof TabsLinea> = {
  render: () => {
    const [activo, setActivo] = React.useState("Resumen");
    return (
      <TabsLinea
        tabs={["Resumen", "Lecciones", "Juegos", "Actividades", "Logros"]}
        activo={activo}
        onCambiar={setActivo}
      />
    );
  },
};

export const PillsDeFiltro: StoryObj<typeof PillsFiltros> = {
  render: () => {
    const [activo, setActivo] = React.useState("Todos");
    return (
      <PillsFiltros
        opciones={["Todos", "Lecciones", "Juegos", "Actividades", "Canciones"]}
        activo={activo}
        onCambiar={setActivo}
      />
    );
  },
};

export const TabsSegmentadoFondo: StoryObj<typeof TabsSegmentado> = {
  render: () => {
    const [activo, setActivo] = React.useState("progreso");
    return (
      <TabsSegmentado
        opciones={[
          { id: "progreso", etiqueta: "Progreso", icono: <Trophy className="size-3.5" /> },
          { id: "actividad", etiqueta: "Actividad", icono: <Activity className="size-3.5" /> },
          { id: "historial", etiqueta: "Historial", icono: <Clock className="size-3.5" /> },
        ]}
        activo={activo}
        onCambiar={setActivo}
      />
    );
  },
};

export const BottomNavigationMobile: StoryObj<typeof BottomNav> = {
  render: () => {
    const [activo, setActivo] = React.useState("inicio");
    return (
      <div style={{ maxWidth: "340px", border: "1px solid #F1F5F9", borderRadius: "12px", overflow: "hidden", backgroundColor: "#FFFFFF" }}>
        <BottomNav
          opciones={[
            { id: "inicio", etiqueta: "Inicio", icono: <Home className="size-4.5" /> },
            { id: "sendas", etiqueta: "Sendas", icono: <BookOpen className="size-4.5" /> },
            { id: "club", etiqueta: "Club", icono: <Users className="size-4.5" /> },
            { id: "perfil", etiqueta: "Perfil", icono: <Trophy className="size-4.5" /> },
          ]}
          activo={activo}
          onCambiar={setActivo}
        />
      </div>
    );
  },
};
