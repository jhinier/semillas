import { createFileRoute } from "@tanstack/react-router";
import { DownloadCloud, RefreshCw, WifiOff } from "lucide-react";
import { useState, type ReactNode } from "react";
import { DescargasBanner } from "@/features/descargas/componentes/descargas-banner";
import { DescargasTabsFilter } from "@/features/descargas/componentes/descargas-tabs-filter";
import { OfflineManagerDialog } from "@/features/descargas/componentes/offline-manager-dialog";
import { RecursoCard } from "@/features/descargas/componentes/recurso-card";
import { StorageWidget } from "@/features/descargas/componentes/storage-widget";
import { useDescargasPage } from "@/features/descargas/hooks/use-descargas-page";
import "./app-descargas.css";

export const Route = createFileRoute("/app/descargas")({ component: DownloadsPage });

function DownloadsPage() {
  const [managerOpen, setManagerOpen] = useState(false);
  const pagina = useDescargasPage();
  const counts = { total: pagina.stats.total, descargados: pagina.stats.descargados, disponibles: pagina.stats.disponibles, actualizaciones: pagina.stats.actualizaciones };
  return <div className="downloads-page">
    <DescargasBanner visible={pagina.showBanner} isOnline={pagina.isOnline} downloadedCount={pagina.stats.descargados} pendingCount={pagina.syncStatus?.pendingCount ?? 0} onCerrar={() => pagina.setShowBanner(false)} onGestionar={() => setManagerOpen(true)} />
    <StorageWidget usageBytes={pagina.storage?.usageBytes ?? 0} quotaBytes={pagina.storage?.quotaBytes ?? 0} packageBytes={pagina.stats.packageBytes} percentage={pagina.storage?.percentage ?? 0} persisted={pagina.storage?.persisted ?? false} downloadedCount={pagina.stats.descargados} isOnline={pagina.isOnline} pendingCount={pagina.syncStatus?.pendingCount ?? 0} onGestionarClick={() => setManagerOpen(true)} onSync={() => void pagina.handleSync()} isSyncing={pagina.isSyncing} />
    <DescargasTabsFilter activeTab={pagina.activeTab} onTabChange={pagina.setActiveTab} counts={counts} sortOrder={pagina.sortOrder} onSortChange={pagina.setSortOrder} searchQuery={pagina.searchQuery} onSearchChange={pagina.setSearchQuery} />
    {pagina.isLoading ? <div className="downloads-grid" aria-label="Cargando temas disponibles">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="offline-theme-card animate-pulse" aria-hidden="true"><div className="offline-theme-card__media bg-slate-200" /><div className="offline-theme-card__body"><div className="h-6 w-2/3 rounded bg-slate-200" /><div className="h-4 w-full rounded bg-slate-100" /></div></div>)}</div> : pagina.isError ? <EmptyState icon={<WifiOff size={31} />} title="No pudimos cargar los temas" description="Conéctate para consultar el catálogo. Los temas descargados seguirán disponibles sin internet." action={pagina.isOnline ? <button type="button" onClick={() => window.location.reload()}><RefreshCw size={17} /> Reintentar</button> : undefined} /> : pagina.filteredTemas.length ? <div className="downloads-grid">{pagina.filteredTemas.map((tema) => <RecursoCard key={tema.id} tema={tema} isOnline={pagina.isOnline} onDownload={() => void pagina.handleDownload(tema.id)} onDelete={() => void pagina.handleDelete(tema.id)} />)}</div> : <EmptyState icon={<DownloadCloud size={31} />} title={pagina.activeTab === "descargados" ? "Todavía no tienes temas descargados" : "No encontramos temas"} description={pagina.activeTab === "descargados" ? "Descarga un tema cuando tengas conexión y podrás abrirlo sin internet." : "Cambia el filtro o limpia la búsqueda para ver más contenido."} />}
    <OfflineManagerDialog open={managerOpen} onOpenChange={setManagerOpen} isOnline={pagina.isOnline} storage={pagina.storage} packageBytes={pagina.stats.packageBytes} downloadedCount={pagina.stats.descargados} pendingCount={pagina.syncStatus?.pendingCount ?? 0} failedCount={pagina.syncStatus?.failedCount ?? 0} lastSyncTimestamp={pagina.syncStatus?.lastSyncTimestamp ?? null} isSyncing={pagina.isSyncing} onSync={() => void pagina.handleSync()} onRetryFailed={() => void pagina.handleRetryFailed()} onDiscardFailed={() => void pagina.handleDiscardFailed()} onDeleteAll={() => void pagina.handleDeleteAll()} />
  </div>;
}

function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return <section className="downloads-empty"><div className="downloads-empty__icon" aria-hidden="true">{icon}</div><h2>{title}</h2><p>{description}</p>{action && <div className="mt-4 [&>button]:inline-flex [&>button]:items-center [&>button]:gap-2 [&>button]:rounded-xl [&>button]:bg-violet-600 [&>button]:px-4 [&>button]:py-3 [&>button]:font-black [&>button]:text-white">{action}</div>}</section>;
}
