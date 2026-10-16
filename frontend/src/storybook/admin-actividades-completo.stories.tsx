import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { GrupoEdad, Senda, Tema } from "@/shared/api/api";
import { AdminActivitiesFilters, AdminActivitiesHeader, AdminActivitiesSummary, AdminActivitiesTable, AdminActivitiesTabs, type ActivityTableRow } from "@/features/admin/componentes/temas";
import { StoryRouter } from "./story-router";

const sendas: Senda[] = [
  { id: "padre", codigo: "padre", nombre: "Senda del Padre", descripcion: null, color_hex: "#E9A23B", nombre_icono: "sun", orden: 1 },
  { id: "hijo", codigo: "hijo", nombre: "Senda del Hijo", descripcion: null, color_hex: "#1565C0", nombre_icono: "heart", orden: 2 },
];
const grupos: GrupoEdad[] = [
  { id: "exploradores", codigo: "exploradores", nombre: "Exploradores", edad_minima: 8, edad_maxima: 11, descripcion: null, orden: 1 },
  { id: "embajadores", codigo: "embajadores", nombre: "Embajadores", edad_minima: 12, edad_maxima: 15, descripcion: null, orden: 2 },
];
const temas: Tema[] = [
  { id: "amor", senda_id: "hijo", titulo: "El amor de Dios", slug: "amor-de-dios", objetivo: "Reconocer el amor de Dios", resumen: null, portada_recurso_id: null, estado: "publicado", version_biblica_id: null, xp_recompensa: 100, minutos_estimados: 20, version_contenido: 1, publicado_en: "2026-07-01" },
  { id: "frutos", senda_id: "padre", titulo: "Frutos del Espíritu", slug: "frutos", objetivo: "Practicar los frutos", resumen: null, portada_recurso_id: null, estado: "borrador", version_biblica_id: null, xp_recompensa: 120, minutos_estimados: 25, version_contenido: 1, publicado_en: null },
];
const actividades: ActivityTableRow[] = [
  {
    id: "act-1", titulo: "Quiz del buen samaritano", consigna: "Elige la respuesta correcta", tipoIcon: "fa-circle-question", tipoIconColor: "text-violet-600", tipoBadgeBg: "bg-violet-100", tipoNombre: "Quiz", tipoCodigo: "cuestionario", temaId: "amor", temaNombre: "El amor de Dios", temaSlug: "amor-de-dios", temaEstado: "publicado", pasoId: null, franjaEdad: "8-11 años", xpText: "25 XP", xp: 25, estado: "publicada", fechaCreacion: "Hoy", dificultad: "Fácil", consignaRaw: "Elige la respuesta correcta", opciones: [], grupoEdadId: "exploradores", sendaColor: { bg: "bg-blue-50", icon: "fa-heart", text: "text-blue-600", nombre: "Hijo" },
  },
  {
    id: "act-2", titulo: "Memoria de los frutos", consigna: "Encuentra las parejas", tipoIcon: "fa-clone", tipoIconColor: "text-amber-600", tipoBadgeBg: "bg-amber-100", tipoNombre: "Flashcards", tipoCodigo: "tarjetas_memoria", temaId: "frutos", temaNombre: "Frutos del Espíritu", temaSlug: "frutos", temaEstado: "borrador", pasoId: null, franjaEdad: "12-15 años", xpText: "40 XP", xp: 40, estado: "borrador", fechaCreacion: "Ayer", dificultad: "Media", consignaRaw: "Encuentra las parejas", opciones: [], grupoEdadId: "embajadores", sendaColor: { bg: "bg-amber-50", icon: "fa-sun", text: "text-amber-600", nombre: "Padre" },
  },
];

function VistaActividades({ loading = false, empty = false }: { loading?: boolean; empty?: boolean }) {
  const [buscar, setBuscar] = useState("");
  const [tema, setTema] = useState("");
  const [senda, setSenda] = useState("");
  const [grupo, setGrupo] = useState("");
  const [tab, setTab] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const limpiar = () => { setBuscar(""); setTema(""); setSenda(""); setGrupo(""); };

  return (
    <StoryRouter initialPath="/admin/actividades">
      <div className="min-h-screen bg-slate-50 p-3 sm:p-8">
        <div className="mx-auto grid max-w-[1500px] gap-5">
          <AdminActivitiesHeader />
          <AdminActivitiesFilters searchValue={buscar} onSearchChange={setBuscar} selectedTemaId={tema} onTemaChange={setTema} temasBase={temas} selectedSendaId={senda} onSendaChange={setSenda} sendasBase={sendas} selectedAgeGroupId={grupo} onAgeGroupChange={setGrupo} ageGroupsBase={grupos} onClear={limpiar} tieneFiltros={Boolean(buscar || tema || senda || grupo)} />
          <AdminActivitiesTabs activeTab={tab} onTabChange={setTab} tabCounts={{ todos: 32, quiz: 12, flashcards: 8, completar: 4, verdaderoFalso: 5, sopa: 3 }} />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <AdminActivitiesTable activities={empty ? [] : actividades} isLoading={loading} totalResultados={empty ? 0 : 32} paginaActual={pagina} onCambiarPagina={setPagina} porPagina={porPagina} onCambiarPorPagina={setPorPagina} />
            <AdminActivitiesSummary stats={{ total: 32, publicadas: 19, revision: 5, borradores: 6, archivadas: 2, pubPct: 59, revPct: 16, borPct: 19, arcPct: 6 }} />
          </div>
        </div>
      </div>
    </StoryRouter>
  );
}

const meta = { title: "Pantallas/Administración/Actividades", component: VistaActividades, parameters: { layout: "fullscreen" } } satisfies Meta<typeof VistaActividades>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
export const Cargando: Story = { args: { loading: true } };
export const Vacio: Story = { args: { empty: true } };
