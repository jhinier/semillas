import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Info, X } from "lucide-react";

import {
  AdminMediaDetailPanel,
  AdminMediaFilters,
  AdminMediaGrid,
  AdminMediaHeader,
  AdminMediaLoadingState,
  AdminMediaUploadProgress,
} from "@/features/admin/componentes/medios";
import { useAdminMediaPage } from "../features/admin/hooks/use-admin-media-page";

export const Route = createFileRoute("/admin/medios")({
  component: AdminMediosPage,
});

function AdminMediosPage() {
  const {
    activeTab,
    clearUploadErrors,
    countsByType,
    countsByUsage,
    detailQuery,
    filteredMedia,
    handleDelete,
    handleFilesChange,
    handleGetFreshUrl,
    handleReplace,
    handleSearchChange,
    handleSortChange,
    handleTabChange,
    handleUpdateMetadata,
    handleUsageFilterChange,
    handleViewModeChange,
    inputArchivoRef,
    isMutating,
    isUploading,
    mediaQuery,
    paginatedItems,
    paginaActual,
    porPagina,
    searchValue,
    selectedDetail,
    selectedId,
    selectedResource,
    selectedSort,
    setPaginaActual,
    setPorPagina,
    setSelectedId,
    totalResources,
    uploadErrors,
    uploadProgress,
    usageFilter,
    viewMode,
  } = useAdminMediaPage();

  return (
    <div className="flex flex-col gap-4 text-left">
      <input
        ref={inputArchivoRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFilesChange}
        accept="image/jpeg,image/png,image/webp,audio/mpeg,audio/aac,audio/ogg,audio/webm,video/mp4,video/webm,application/pdf"
      />

      <AdminMediaHeader
        totalItems={totalResources}
        isUploading={isUploading}
        onSubirRecurso={() => inputArchivoRef.current?.click()}
      />

      <div
        role="note"
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-violet-50/70 px-4 py-3 text-xs font-semibold text-slate-700"
      >
        <div className="flex items-center gap-2">
          <Info size={16} className="shrink-0 text-violet-600" />
          <span>
            <strong className="font-black text-slate-900">Límites máximos de subida por archivo:</strong>{" "}
            Video: <strong className="text-violet-700">máx. 50 MB</strong> (MP4, WebM) · Audio: <strong className="text-violet-700">máx. 20 MB</strong> (MP3, AAC, OGG, WebM) · Imagen: <strong className="text-violet-700">máx. 5 MB</strong> (JPG, PNG, WebP) · Documento: <strong className="text-violet-700">máx. 10 MB</strong> (PDF)
          </span>
        </div>
      </div>

      {uploadErrors.length > 0 ? (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0 text-rose-600" size={20} />
            <div className="space-y-1">
              <strong className="block font-black text-rose-900">
                No se pudo completar la subida del archivo
              </strong>
              <ul className="list-disc pl-4 space-y-1 font-medium text-rose-700">
                {uploadErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
          <button
            type="button"
            onClick={clearUploadErrors}
            aria-label="Cerrar alerta de error"
            className="rounded-lg p-1 text-rose-500 hover:bg-rose-100 hover:text-rose-800"
          >
            <X size={18} />
          </button>
        </div>
      ) : null}

      <AdminMediaFilters
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        selectedSort={selectedSort}
        onSortChange={handleSortChange}
        usageFilter={usageFilter}
        onUsageFilterChange={handleUsageFilterChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        totalItems={totalResources}
        countsByType={countsByType}
        countsByUsage={countsByUsage}
      />

      <AdminMediaLoadingState isLoading={mediaQuery.isLoading} />

      {mediaQuery.isError ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
        >
          No se pudieron cargar los recursos multimedia. Revisa tu conexión e
          inténtalo de nuevo.
        </div>
      ) : null}

      {!mediaQuery.isLoading ? (
        <div
          className={`grid min-w-0 items-start gap-5 ${
            selectedResource
              ? "xl:grid-cols-[minmax(0,1fr)_400px]"
              : "grid-cols-1"
          }`}
        >
          <AdminMediaGrid
            items={paginatedItems}
            totalItems={filteredMedia.length}
            selectedId={selectedId}
            viewMode={viewMode}
            onSelect={(id) => setSelectedId(selectedId === id ? "" : id)}
            paginaActual={paginaActual}
            porPagina={porPagina}
            onCambiarPagina={setPaginaActual}
            onCambiarPorPagina={setPorPagina}
          />

          {selectedResource ? (
            <AdminMediaDetailPanel
              selectedResource={selectedResource}
              detail={selectedDetail}
              isLoading={detailQuery.isLoading}
              isBusy={isMutating}
              onClose={() => setSelectedId("")}
              onDelete={handleDelete}
              onUpdateMetadata={handleUpdateMetadata}
              onReplace={handleReplace}
              onGetFreshUrl={handleGetFreshUrl}
            />
          ) : null}
        </div>
      ) : null}

      <AdminMediaUploadProgress progress={uploadProgress} />
    </div>
  );
}
