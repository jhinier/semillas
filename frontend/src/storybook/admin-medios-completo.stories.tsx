import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { MediaCardItem } from "@/features/admin/admin-media.types";
import { AdminMediaDetailPanel, AdminMediaFilters, AdminMediaGrid, AdminMediaHeader, AdminMediaLoadingState, AdminMediaTypeTabs, AdminMediaUploadProgress, type TipoMedia } from "@/features/admin/componentes/medios";
import temaImg from "@/assets/images/Ilustraciones/Tema1.webp";
import quizImg from "@/assets/images/Ilustraciones/banner_quiz.webp";

const items: MediaCardItem[] = [
  { id: "m1", nombre: "Portada del amor de Dios", tipo: "imagen", tipoLabel: "Imagen", imgUrl: temaImg, usadoEnCount: 3, carpeta: "Ilustraciones", subidoPor: "Andres Gaibor", fechaSubido: "10 jul 2026", fechaTimestamp: Date.now(), tamano: "1.2 MB", formato: "PNG", resolucion: "1920 × 1080", dimensiones: "16:9", altText: "Niños aprendiendo sobre el amor de Dios", etiquetas: ["amor", "niños", "portada"] },
  { id: "m2", nombre: "Banner para quiz", tipo: "imagen", tipoLabel: "Imagen", imgUrl: quizImg, usadoEnCount: 1, carpeta: "Ilustraciones", subidoPor: "Andres Gaibor", fechaSubido: "9 jul 2026", fechaTimestamp: Date.now() - 86400000, tamano: "840 KB", formato: "PNG", resolucion: "1600 × 900", dimensiones: "16:9", altText: "Marco ilustrado para preguntas", etiquetas: ["quiz", "banner"] },
  { id: "m3", nombre: "Narración de la parábola", tipo: "audio", tipoLabel: "Audio", imgUrl: "", usadoEnCount: null, carpeta: "Audios", subidoPor: "Equipo Semillas", fechaSubido: "8 jul 2026", fechaTimestamp: Date.now() - 172800000, tamano: "3.4 MB", formato: "MP3", resolucion: "—", dimensiones: "—", altText: "Narración en audio", etiquetas: ["audio", "parábola"] },
];

function VistaMedios({ estado = "datos" }: { estado?: "datos" | "cargando" | "vacio" | "subiendo" }) {
  const [buscar, setBuscar] = useState("");
  const [tab, setTab] = useState<TipoMedia>("");
  const [carpeta, setCarpeta] = useState("");
  const [orden, setOrden] = useState("recientes");
  const [seleccionado, setSeleccionado] = useState("m1");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(12);
  const visibles = estado === "vacio" ? [] : items;
  const detalle = items.find((item) => item.id === seleccionado) ?? null;
  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-8">
      <div className="mx-auto grid max-w-[1500px] gap-5">
        <AdminMediaHeader onSubirRecurso={() => undefined} />
        <AdminMediaTypeTabs activeTab={tab} onTabChange={setTab} />
        <AdminMediaFilters searchValue={buscar} onSearchChange={setBuscar} activeTab={tab} onTabChange={setTab} selectedFolder={carpeta} onFolderChange={setCarpeta} selectedSort={orden} onSortChange={setOrden} />
        <AdminMediaLoadingState isLoading={estado === "cargando"} />
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-4"><AdminMediaGrid items={visibles} totalItems={visibles.length} selectedId={seleccionado} onSelect={setSeleccionado} paginaActual={pagina} porPagina={porPagina} onCambiarPagina={setPagina} onCambiarPorPagina={setPorPagina} /></div>
          <AdminMediaDetailPanel selectedResource={estado === "vacio" ? null : detalle} onDelete={() => undefined} />
        </div>
      </div>
      <AdminMediaUploadProgress isUploading={estado === "subiendo"} />
    </div>
  );
}

const meta = { title: "Pantallas/Administración/Medios", component: VistaMedios, parameters: { layout: "fullscreen" } } satisfies Meta<typeof VistaMedios>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
export const Cargando: Story = { args: { estado: "cargando" } };
export const Vacio: Story = { args: { estado: "vacio" } };
export const Subiendo: Story = { args: { estado: "subiendo" } };
