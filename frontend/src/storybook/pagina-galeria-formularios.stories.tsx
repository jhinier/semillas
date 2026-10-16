import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Lock, Mail, Search, User } from "lucide-react";

import { Checkbox } from "../componentes/ui/checkbox";
import { Input, InputBusqueda, InputContraseña } from "../componentes/ui/input";
import { Radio } from "../componentes/ui/radio";
import { Select } from "../componentes/ui/select";
import { Switch } from "../componentes/ui/switch";
import { Textarea } from "../componentes/ui/textarea";

const meta = {
  title: "Páginas/Galería Formularios",
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const VistaDesktop: Story = {
  render: () => (
    <div className="min-h-screen bg-[#F7F4EC] p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <header>
          <p className="text-xs font-black uppercase tracking-wider text-[#6C3AED]">Galería Formularios</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Inputs y controles con todos sus estados</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Esta página junta campos de texto, búsqueda, contraseña, selección y toggles para revisar alineación y mensajes de validación.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">Inputs de texto</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Input placeholder="Nombre" iconoIzquierdo={<User className="size-4 text-gray-400" />} />
              <Input placeholder="Correo" iconoIzquierdo={<Mail className="size-4 text-gray-400" />} />
              <InputBusqueda placeholder="Buscar temas" iconoBusqueda={<Search className="size-4 text-gray-400" />} />
              <InputContraseña placeholder="Contraseña" iconoIzquierdo={<Lock className="size-4 text-gray-400" />} />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">Estados</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Input placeholder="Normal" />
              <Input placeholder="Error" estado="error" mensajeError="El correo no es válido" defaultValue="juan@email" />
              <Input placeholder="Éxito" estado="exito" mensajeExito="Todo listo" defaultValue="juan@email.com" />
              <Input disabled placeholder="Deshabilitado" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">Select y textarea</h2>
            <div className="mt-4 grid gap-3">
              <Select placeholder="Selecciona una senda">
                <option value="padre">Padre</option>
                <option value="hijo">Hijo</option>
                <option value="espiritu">Espíritu Santo</option>
              </Select>
              <Textarea
                placeholder="Escribe una reflexión"
                mostrarContador
                maxCaracteres={200}
                defaultValue="Hoy aprendí que Dios guía mis pasos."
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">Checkbox, radio y switch</h2>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Checkbox etiqueta="Acepto recibir novedades" defaultChecked />
                <Checkbox etiqueta="Guardar para después" />
                <Checkbox etiqueta="Opción indeterminada" indeterminate />
              </div>
              <div className="space-y-2">
                <Radio name="edad" value="5-8" etiqueta="Semillas" defaultChecked />
                <Radio name="edad" value="9-12" etiqueta="Exploradores" />
                <Radio name="edad" value="13-17" etiqueta="Embajadores" />
              </div>
              <div className="space-y-2">
                <Switch etiqueta="Notificaciones activadas" defaultChecked />
                <Switch etiqueta="Modo lectura" />
              </div>
            </div>
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
          <p className="text-xs font-black uppercase tracking-wider text-[#6C3AED]">Galería Formularios</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Validación en móvil</h1>
        </div>
        <Input placeholder="Correo" iconoIzquierdo={<Mail className="size-4 text-gray-400" />} />
        <Input placeholder="Error" estado="error" mensajeError="Formato inválido" defaultValue="juan@email" />
        <InputContraseña placeholder="Contraseña" iconoIzquierdo={<Lock className="size-4 text-gray-400" />} />
        <InputBusqueda placeholder="Buscar" iconoBusqueda={<Search className="size-4 text-gray-400" />} />
        <Select placeholder="Selecciona una opción">
          <option value="1">Opción 1</option>
          <option value="2">Opción 2</option>
        </Select>
        <Textarea placeholder="Escribe una respuesta" mostrarContador maxCaracteres={120} />
        <Checkbox etiqueta="Aceptar términos" />
        <Radio name="móvil" value="a" etiqueta="Opción A" defaultChecked />
        <Switch etiqueta="Modo offline" />
      </div>
    </div>
  )
};
