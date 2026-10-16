import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import { Bell, Check, Home, Search, UserRound } from "lucide-react";
import { CSSConfetti } from "@/componentes/ui/Confetti";
import { AvatarEmoji } from "@/componentes/ui/avatar-emoji";
import { Badge } from "@/componentes/ui/badge";
import { CampanaBadge } from "@/componentes/ui/campana-badge";
import { CampoBusqueda } from "@/componentes/ui/campo-busqueda";
import { Chip } from "@/componentes/ui/chip-base";
import { DetailRow } from "@/componentes/ui/detail-row";
import { ImageWithFallback } from "@/componentes/ui/image-with-fallback";
import { InfoNivelXP } from "@/componentes/ui/info-nivel-xp";
import { Input } from "@/componentes/ui/input-base";
import { InputContraseña } from "@/componentes/ui/input-password";
import { InputBusqueda } from "@/componentes/ui/input-search";
import { Paginacion } from "@/componentes/ui/paginacion";
import { PillsFiltros } from "@/componentes/ui/pills-filtros";
import { OfflineBanner, SyncStatusBadge } from "@/componentes/ui/sync-status-badge";
import { TablaSkeleton, TablaSkeletonPersonalizado } from "@/componentes/ui/tabla-skeleton";
import { TabsLinea } from "@/componentes/ui/tabs-linea";
import { TabsOpciones } from "@/componentes/ui/tabs-opciones";
import { TabsSegmentado } from "@/componentes/ui/tabs-segmentado";

const meta = {
  title: "UI/Catálogo complementario",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Lienzo({ children }: { children: ReactNode }) {
  return <div className="w-[min(92vw,720px)] rounded-3xl bg-white p-6 shadow-sm">{children}</div>;
}

export const AvataresYBadges: Story = {
  render: () => (
    <Lienzo>
      <div className="flex flex-wrap items-center gap-4">
        <AvatarEmoji emoji="🌱" className="size-14 text-2xl" />
        <Badge color="verde" icono={<Check />}>Completado</Badge>
        <Badge color="morado">Explorador</Badge>
        <Chip color="azul" icono={<Home />}>Senda del Padre</Chip>
        <CampanaBadge conteo={3} />
        <CampanaBadge conteo={0} />
      </div>
    </Lienzo>
  ),
};

function CamposInteractivos() {
  const [buscar, setBuscar] = useState("");
  return (
    <Lienzo>
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoBusqueda valor={buscar} onChange={setBuscar} placeholder="Buscar temas" />
        <InputBusqueda placeholder="Buscar contenido" />
        <Input placeholder="Nombre visible" />
        <Input estado="exito" defaultValue="Semillero" mensajeExito="Nombre disponible" />
        <Input estado="error" defaultValue="a" mensajeError="Escribe al menos 3 caracteres" />
        <InputContraseña defaultValue="semillas123" />
      </div>
    </Lienzo>
  );
}

export const CamposDeEntrada: Story = { render: () => <CamposInteractivos /> };

function NavegacionInteractiva() {
  const [tab, setTab] = useState("Todos");
  const [segmento, setSegmento] = useState("inicio");
  return (
    <Lienzo>
      <div className="space-y-6">
        <TabsLinea tabs={["Todos", "En progreso", "Completados"]} activo={tab} onCambiar={setTab} />
        <TabsOpciones
          activo={segmento}
          onCambiar={setSegmento}
          opciones={[
            { id: "inicio", label: "Inicio", icono: <Home />, count: 8 },
            { id: "perfil", label: "Perfil", icono: <UserRound />, count: 2 },
          ]}
        />
        <TabsOpciones
          variante="pildora"
          activo={segmento}
          onCambiar={setSegmento}
          opciones={[
            { id: "inicio", label: "Inicio" },
            { id: "perfil", label: "Perfil" },
          ]}
        />
        <TabsSegmentado
          activo={segmento}
          onCambiar={setSegmento}
          opciones={[
            { id: "inicio", etiqueta: "Inicio", icono: <Home className="size-4" /> },
            { id: "perfil", etiqueta: "Perfil", icono: <UserRound className="size-4" /> },
          ]}
        />
      </div>
    </Lienzo>
  );
}

export const TabsYNavegacion: Story = { render: () => <NavegacionInteractiva /> };

function FiltrosInteractivos() {
  const [activo, setActivo] = useState("Todos");
  return (
    <Lienzo>
      <PillsFiltros opciones={["Todos", "Padre", "Hijo", "Espíritu"]} activo={activo} onCambiar={setActivo} />
    </Lienzo>
  );
}

export const FiltrosPildora: Story = { render: () => <FiltrosInteractivos /> };

function PaginacionInteractiva() {
  const [pagina, setPagina] = useState(3);
  const [porPagina, setPorPagina] = useState(10);
  return (
    <Lienzo>
      <Paginacion
        total={126}
        paginaActual={pagina}
        porPagina={porPagina}
        onCambiarPagina={setPagina}
        onCambiarPorPagina={setPorPagina}
      />
    </Lienzo>
  );
}

export const PaginacionCompleta: Story = { render: () => <PaginacionInteractiva /> };

export const MetadatosYFallbacks: Story = {
  render: () => (
    <Lienzo>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1 rounded-2xl border border-slate-100 p-4">
          <DetailRow label="Formato" value="PNG" />
          <DetailRow label="Tamaño" value="1.2 MB" />
          <DetailRow label="Estado" value="Publicado" noBorder />
        </div>
        <div className="h-36 overflow-hidden rounded-2xl bg-slate-50">
          <ImageWithFallback src="/archivo-que-no-existe.png" alt="Imagen no disponible" tipo="imagen" />
        </div>
        <InfoNivelXP nivelText="Nivel 4" xpText="860 XP" />
        <InfoNivelXP nivelText="Cuenta vinculada" isVinculado />
      </div>
    </Lienzo>
  ),
};

export const SkeletonDeTabla: Story = {
  render: () => (
    <Lienzo>
      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <table className="w-full">
          <thead><tr><th className="p-3 text-left text-xs">Tema</th><th className="p-3 text-left text-xs">Estado</th><th className="p-3 text-left text-xs">XP</th></tr></thead>
          <TablaSkeleton filas={4} columnas={3} />
        </table>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
        <table className="w-full">
          <TablaSkeletonPersonalizado filas={2}>
            <td className="p-4"><div className="h-4 rounded bg-slate-100" /></td>
            <td className="p-4"><div className="h-4 rounded bg-slate-100" /></td>
          </TablaSkeletonPersonalizado>
        </table>
      </div>
    </Lienzo>
  ),
};

export const EstadoDeSincronizacion: Story = {
  render: () => (
    <Lienzo>
      <div className="flex flex-col gap-4">
        <OfflineBanner />
        <div className="flex items-center gap-3"><SyncStatusBadge /><span className="text-sm text-slate-500">Estado conectado a IndexedDB</span></div>
      </div>
    </Lienzo>
  ),
};

export const Confeti: Story = {
  render: () => (
    <div className="relative grid h-[520px] w-[min(92vw,720px)] place-items-center overflow-hidden rounded-3xl bg-violet-700 text-center text-white">
      <div><Bell className="mx-auto mb-3 size-10" /><h2 className="text-3xl font-black">¡Actividad completada!</h2></div>
      <CSSConfetti />
    </div>
  ),
};

export const VistaMovil: Story = {
  ...CamposDeEntrada,
  globals: { viewport: { value: "movilCompacto", isRotated: false } },
};
