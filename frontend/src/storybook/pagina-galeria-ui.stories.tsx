import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { BookOpen, Home, PlayCircle, Sprout, Trophy, UserRound } from "lucide-react";

import { Alerta } from "../componentes/ui/alerta";
import { BottomNav } from "../componentes/ui/bottom-nav";
import { Boton } from "../componentes/ui/boton";
import { EmptyState } from "../componentes/ui/empty-state";
import { LoaderEstado } from "../componentes/ui/loader-estado";
import { ProgresoCircular } from "../componentes/ui/progreso-circular";
import { VersionInfo } from "../componentes/ui/version-info";

const opcionesBottomNav = [
  { id: "inicio", etiqueta: "Inicio", icono: <Home className="size-5" /> },
  { id: "sendas", etiqueta: "Sendas", icono: <BookOpen className="size-5" /> },
  { id: "jugar", etiqueta: "Jugar", icono: <PlayCircle className="size-5" /> },
  { id: "logros", etiqueta: "Logros", icono: <Trophy className="size-5" /> },
  { id: "perfil", etiqueta: "Perfil", icono: <UserRound className="size-5" /> }
];

const meta = {
  title: "Páginas/Galería UI",
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function BottomNavDemo() {
  const [activo, setActivo] = React.useState("inicio");

  return <BottomNav opciones={opcionesBottomNav} activo={activo} onCambiar={setActivo} />;
}

export const VistaDesktop: Story = {
  render: () => (
    <div className="min-h-screen bg-[#F7F4EC] p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[32px] bg-[#123B2C] p-8 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#F4B740]">
                <Sprout className="size-4" />
                Galería UI
              </div>
              <h1 className="text-4xl font-black tracking-tight">Componentes listos para detectar errores visuales</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
                Esta vista agrupa estados, loaders, navegación y feedback para revisar espaciado, contraste y consistencia.
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 p-3">
              <Boton className="bg-[#F4B740] text-[#123B2C] hover:bg-[#e3a72b]">
                Revisar catálogo
              </Boton>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          <Alerta variante="informacion">Tu sesión está sincronizada con la nube.</Alerta>
          <Alerta variante="offline">Modo offline activo. El contenido descargado sigue disponible.</Alerta>
          <Alerta variante="atencion">Hay una pregunta sin responder.</Alerta>
          <Alerta variante="exito">Lección completada y XP sumada.</Alerta>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">Carga</h2>
            <LoaderEstado mensaje="Cargando contenidos..." />
            <LoaderEstado mensaje="Sincronizando progreso..." />
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:col-span-1 xl:col-span-1">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">Progreso</h2>
            <div className="mt-5 flex flex-wrap gap-5">
              <ProgresoCircular porcentaje={20} etiqueta="Inicio" color="morado" tamano={72} />
              <ProgresoCircular porcentaje={55} etiqueta="Avance" color="verde" tamano={72} />
              <ProgresoCircular porcentaje={90} etiqueta="Meta" color="naranja" tamano={72} />
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:col-span-2 xl:col-span-1">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">Vacío</h2>
            <EmptyState mensaje="Todavía no hay resultados para este filtro." />
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-1">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">Sistema</h2>
            <VersionInfo versionApp="1.3.0" entorno="desarrollo" fechaCompilacion="8 de julio de 2026" />
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">Acciones</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Boton>Continuar</Boton>
            <Boton variante="contorno">Ver más</Boton>
            <Boton variante="secundario">Guardar</Boton>
            <Boton variante="texto">Más opciones</Boton>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-0 shadow-xl">
          <BottomNavDemo />
        </section>
      </div>
    </div>
  )
};

export const VistaMovil: Story = {
  globals: { viewport: { value: "movilApp", isRotated: false } },
  render: () => (
    <div className="min-h-screen bg-[#F7F4EC] p-4">
      <div className="mx-auto w-[390px] max-w-full space-y-4 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">
        <div className="bg-[#123B2C] px-5 py-6 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-[#F4B740]">
            <Sprout className="size-4" />
            Vista móvil
          </div>
          <h1 className="mt-3 text-2xl font-black tracking-tight">Estado y navegación</h1>
          <p className="mt-2 text-sm text-white/75">La misma pantalla en 390px para validar densidad y scroll.</p>
        </div>

        <div className="space-y-3 px-4">
          <Alerta variante="offline">Modo sin conexión.</Alerta>
          <LoaderEstado mensaje="Cargando contenido..." />
          <EmptyState mensaje="No hay lecciones para esta vista." />
          <div className="flex justify-center gap-4 py-4">
            <ProgresoCircular porcentaje={35} etiqueta="XP" color="morado" tamano={68} />
            <ProgresoCircular porcentaje={78} etiqueta="Meta" color="verde" tamano={68} />
          </div>
          <VersionInfo versionApp="1.3.0" entorno="pruebas" fechaCompilacion="8 de julio de 2026" />
        </div>

        <BottomNavDemo />
      </div>
    </div>
  )
};
