import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryRouter } from "@/storybook/story-router";
import { DescargasBanner } from "@/features/descargas/componentes/descargas-banner";
import { DescargasTabsFilter } from "@/features/descargas/componentes/descargas-tabs-filter";
import { RecursoCard } from "@/features/descargas/componentes/recurso-card";
import { StorageWidget } from "@/features/descargas/componentes/storage-widget";
import type { TemaDescargaUI } from "@/features/descargas/hooks/use-descargas-page";
import "@/routes/app-descargas.css";

const temas: TemaDescargaUI[] = [
  { id: "1", titulo: "El Amor de Dios", descripcion: "Aprende sobre el amor fiel y cercano de Dios.", imagenUrl: "https://picsum.photos/320/260?random=1", senda: "Senda del Padre", color: "#d68b13", minutos: 20, xp: 150, version: 1, descargado: true, actualizacionDisponible: false, tamanoBytes: 18_000_000, pasos: 6, actividades: 8, medios: 12, descargadoEn: new Date().toISOString(), progresoDescarga: null, errorDescarga: null },
  { id: "2", titulo: "Jesús enseña con parábolas", descripcion: "Historias sencillas para comprender verdades profundas.", imagenUrl: "https://picsum.photos/320/260?random=2", senda: "Senda del Hijo", color: "#2676d2", minutos: 20, xp: 150, version: 2, descargado: false, actualizacionDisponible: false, tamanoBytes: null, pasos: null, actividades: null, medios: null, descargadoEn: null, progresoDescarga: null, errorDescarga: null },
];

function DescargasPageStory() {
  return <StoryRouter initialPath="/app/descargas"><div className="downloads-page mx-auto max-w-6xl p-4"><DescargasBanner visible isOnline downloadedCount={1} pendingCount={1} onCerrar={() => undefined} onGestionar={() => undefined} /><StorageWidget usageBytes={148_000_000} quotaBytes={2_000_000_000} packageBytes={18_000_000} percentage={7} persisted downloadedCount={1} isOnline pendingCount={1} onGestionarClick={() => undefined} onSync={() => undefined} isSyncing={false} /><DescargasTabsFilter activeTab="todos" onTabChange={() => undefined} counts={{ total: 2, descargados: 1, disponibles: 1, actualizaciones: 0 }} sortOrder="recientes" onSortChange={() => undefined} searchQuery="" onSearchChange={() => undefined} /><div className="downloads-grid">{temas.map((tema) => <RecursoCard key={tema.id} tema={tema} isOnline onDownload={() => undefined} onDelete={() => undefined} />)}</div></div></StoryRouter>;
}

const meta = { title: "Pantallas/App/Descargas", component: DescargasPageStory, parameters: { layout: "fullscreen" } } satisfies Meta<typeof DescargasPageStory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
