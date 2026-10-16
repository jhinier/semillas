import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Award, Book, Download, Flame, Shield, Sprout, Star } from "lucide-react";

import { BarraProgreso } from "../componentes/ui/barra-progreso";
import { Card } from "../componentes/ui/card-base";
import { CardInsignia } from "../componentes/ui/card-insignia";
import { CardLeccion } from "../componentes/ui/card-leccion";
import { CardMetrica } from "../componentes/ui/card-metrica";
import { CardPerfil } from "../componentes/ui/card-perfil";
import { Chip } from "../componentes/ui/chip";

const meta = {
  title: "Páginas/Galería Aprendizaje",
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const VistaDesktop: Story = {
  render: () => (
    <div className="min-h-screen bg-[#F7F4EC] p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-[#6C3AED]">Galería Aprendizaje</p>
            <h1 className="text-3xl font-black tracking-tight">Lecciones, métricas e insignias en una sola vista</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Esta página agrupa los componentes de progreso para validar tamaños, jerarquía y estados de avance.
            </p>
          </div>
          <Chip color="verde" forma="badgePildora" icono={<Sprout className="size-3.5" />}>
            Modo aprendizaje
          </Chip>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CardMetrica tipo="xp" titulo="XP total" valor="2,450" subtexto="+320 esta semana" />
          <CardMetrica tipo="racha" titulo="Racha actual" valor="5 días" subtexto="Sigue así" />
          <CardMetrica tipo="lecciones" titulo="Lecciones" valor="18 / 30" subtexto="60% completado" />
          <CardMetrica tipo="offline" titulo="Descargadas" valor="12" subtexto="Sin conexión" />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">Lecciones</h2>
              <Chip color="morado" forma="badgePildora">Senda del Padre</Chip>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <CardLeccion estado="porDefecto" senda="Senda del Padre" titulo="La creación" descripcion="Dios creó el cielo y la tierra en seis días." duracion="8 min" xp={20} favorito={false} />
              <CardLeccion estado="enProgreso" senda="Senda del Hijo" titulo="Jesús y los niños" descripcion="Jesús ama a los niños y los bendice siempre." duracion="10 min" xp={20} progreso={60} favorito={false} />
              <CardLeccion estado="completada" senda="Senda del Espíritu" titulo="El Espíritu Santo" descripcion="Él nos guía, nos consuela y nos da fuerza." duracion="12 min" xp={30} progreso={100} favorito />
              <CardLeccion estado="descargada" senda="Senda del Padre" titulo="El arca de Noé" descripcion="Contenido listo para jugar sin conexión." duracion="9 min" xp={20} favorito={false} />
            </div>
          </div>

          <div className="space-y-4">
            <CardPerfil
              nombre="Samuel"
              nivel={7}
              racha={5}
              lecciones={18}
              logros={3}
              xpActual={2450}
              xpMaximo={3000}
            />

            <Card className="p-5">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">Progreso rápido</h2>
              <div className="mt-4 space-y-3">
                <BarraProgreso valor={3} maximo={8} etiqueta="Senda del Padre" color="morado" />
                <BarraProgreso valor={6} maximo={10} etiqueta="Senda del Hijo" color="verde" />
                <BarraProgreso valor={4} maximo={5} etiqueta="Senda del Espíritu Santo" color="naranja" />
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-4">
          <CardInsignia color="verde" titulo="Primer Paso" descripcion="Completaste tu primera lección." obtenida icono={<Award />} />
          <CardInsignia color="morado" titulo="Explorador Bíblico" descripcion="Completa 10 lecciones." obtenida={false} icono={<Book />} progresoActual={7} progresoMaximo={10} />
          <CardInsignia color="amarillo" titulo="Racha Heroica" descripcion="Mantén 7 días seguidos." obtenida={false} icono={<Flame />} progresoActual={5} progresoMaximo={7} />
          <CardInsignia color="gris" titulo="Guardián" descripcion="Completa 100 lecciones." obtenida={false} icono={<Shield />} />
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">Resumen visual</h2>
            <Chip color="azul" forma="badgePildora" icono={<Download className="size-3.5" />}>
              Descargas offline
            </Chip>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Chip color="verde" forma="badgePildora" icono={<Star className="size-3.5" />}>Favorito</Chip>
            <Chip color="morado" forma="badgePildora">CRECER</Chip>
            <Chip color="amarillo" forma="badgePildora">7 días</Chip>
            <Chip color="gris" forma="badgePildora">Bloqueado</Chip>
          </div>
        </section>
      </div>
    </div>
  )
};

export const VistaMovil: Story = {
  globals: { viewport: { value: "movilApp", isRotated: false } },
  render: () => (
    <div className="min-h-screen bg-[#F7F4EC] p-4">
      <div className="mx-auto w-[390px] max-w-full space-y-4 rounded-[32px] border border-slate-200 bg-white p-4 shadow-xl">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-[#6C3AED]">Galería Aprendizaje</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Progreso en móvil</h1>
        </div>
        <CardMetrica tipo="xp" titulo="XP" valor="2,450" subtexto="+320 esta semana" />
        <CardLeccion estado="enProgreso" senda="Senda del Hijo" titulo="Jesús y los niños" descripcion="Jesús ama a los niños y los bendice siempre." duracion="10 min" xp={20} progreso={60} favorito={false} />
        <CardPerfil nombre="Samuel" nivel={7} racha={5} lecciones={18} logros={3} xpActual={2450} xpMaximo={3000} />
        <BarraProgreso valor={5} maximo={8} etiqueta="Avance general" color="morado" />
        <CardInsignia color="morado" titulo="Explorador Bíblico" descripcion="Completa 10 lecciones." obtenida={false} icono={<Book />} progresoActual={7} progresoMaximo={10} />
      </div>
    </div>
  )
};
