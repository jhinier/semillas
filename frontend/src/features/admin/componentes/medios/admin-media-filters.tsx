import type { ReactNode } from "react";
import {
  FileText,
  Grid3X3,
  Image as ImageIcon,
  Layers3,
  List,
  Search,
  Video,
  Volume2,
  X,
} from "lucide-react";

import type {
  MediaTypeFilter,
  MediaUsageFilter,
  MediaViewMode,
} from "../../admin-media.types";

type Props = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeTab: MediaTypeFilter;
  onTabChange: (tab: MediaTypeFilter) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  usageFilter: MediaUsageFilter;
  onUsageFilterChange: (filter: MediaUsageFilter) => void;
  viewMode: MediaViewMode;
  onViewModeChange: (mode: MediaViewMode) => void;
  totalItems: number;
  countsByType: Record<Exclude<MediaTypeFilter, "">, number>;
  countsByUsage: Record<MediaUsageFilter, number>;
};

const TYPE_OPTIONS: Array<{
  id: MediaTypeFilter;
  label: string;
  icon: typeof Layers3;
}> = [
  { id: "", label: "Todos", icon: Layers3 },
  { id: "imagen", label: "Imágenes", icon: ImageIcon },
  { id: "audio", label: "Audios", icon: Volume2 },
  { id: "video", label: "Videos", icon: Video },
  { id: "documento", label: "Documentos", icon: FileText },
];

export function AdminMediaFilters({
  searchValue,
  onSearchChange,
  activeTab,
  onTabChange,
  selectedSort,
  onSortChange,
  usageFilter,
  onUsageFilterChange,
  viewMode,
  onViewModeChange,
  totalItems,
  countsByType,
  countsByUsage,
}: Props) {
  const countFor = (type: MediaTypeFilter) => (type ? countsByType[type] : totalItems);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <label className="relative min-w-0 flex-1" htmlFor="admin-media-search">
          <span className="sr-only">Buscar recursos multimedia</span>
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            id="admin-media-search"
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nombre, descripción o formato…"
            autoComplete="off"
            className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
          />
          {searchValue ? (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
            >
              <X size={15} />
            </button>
          ) : null}
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex min-w-[170px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3">
            <span className="text-xs font-extrabold text-slate-500">Estado</span>
            <select
              value={usageFilter}
              onChange={(event) =>
                onUsageFilterChange(event.target.value as MediaUsageFilter)
              }
              aria-label="Filtrar por uso y accesibilidad"
              className="h-10 flex-1 cursor-pointer bg-transparent text-sm font-bold text-slate-700 outline-none"
            >
              <option value="todos">Todos ({countsByUsage.todos})</option>
              <option value="usados">En uso ({countsByUsage.usados})</option>
              <option value="sin_uso">Sin usar ({countsByUsage.sin_uso})</option>
              <option value="accesibilidad">
                Accesibilidad pendiente ({countsByUsage.accesibilidad})
              </option>
            </select>
          </label>

          <label className="flex min-w-[180px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3">
            <span className="text-xs font-extrabold text-slate-500">Orden</span>
            <select
              value={selectedSort}
              onChange={(event) => onSortChange(event.target.value)}
              aria-label="Ordenar recursos"
              className="h-10 flex-1 cursor-pointer bg-transparent text-sm font-bold text-slate-700 outline-none"
            >
              <option value="recientes">Más recientes</option>
              <option value="antiguos">Más antiguos</option>
              <option value="nombre">Nombre A–Z</option>
            </select>
          </label>

          <div
            className="inline-flex h-11 items-center rounded-2xl border border-slate-200 bg-slate-50 p-1"
            aria-label="Cambiar vista"
          >
            <ViewButton
              active={viewMode === "grid"}
              label="Vista de cuadrícula"
              onClick={() => onViewModeChange("grid")}
            >
              <Grid3X3 size={17} />
            </ViewButton>
            <ViewButton
              active={viewMode === "list"}
              label="Vista de lista"
              onClick={() => onViewModeChange("list")}
            >
              <List size={18} />
            </ViewButton>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar por tipo">
        {TYPE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = activeTab === option.id;

          return (
            <button
              key={option.id || "todos"}
              type="button"
              aria-pressed={active}
              onClick={() => onTabChange(option.id)}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-2xl border px-3.5 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                active
                  ? "border-violet-600 bg-violet-600 text-white shadow-[0_8px_18px_rgba(109,53,232,0.2)]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              {option.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {countFor(option.id)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ViewButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
        active
          ? "bg-white text-violet-700 shadow-sm"
          : "text-slate-400 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
