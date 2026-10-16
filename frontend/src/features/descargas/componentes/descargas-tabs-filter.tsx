import { Search, X } from "lucide-react";
import type { FiltroDescarga, OrdenDescarga } from "../hooks/use-descargas-page";

export interface DescargasTabsFilterProps {
  activeTab: FiltroDescarga;
  onTabChange: (tab: FiltroDescarga) => void;
  counts: { total: number; descargados: number; disponibles: number; actualizaciones: number };
  sortOrder: OrdenDescarga;
  onSortChange: (sort: OrdenDescarga) => void;
  searchQuery: string;
  onSearchChange: (search: string) => void;
}

const tabs: Array<{ id: FiltroDescarga; label: string; countKey: keyof DescargasTabsFilterProps["counts"] }> = [
  { id: "todos", label: "Todos", countKey: "total" },
  { id: "descargados", label: "En mi dispositivo", countKey: "descargados" },
  { id: "disponibles", label: "Por descargar", countKey: "disponibles" },
  { id: "actualizaciones", label: "Actualizaciones", countKey: "actualizaciones" },
];

export function DescargasTabsFilter({ activeTab, onTabChange, counts, sortOrder, onSortChange, searchQuery, onSearchChange }: DescargasTabsFilterProps) {
  return <section className="downloads-filters" aria-label="Filtros de descargas">
    <div className="downloads-filters__tabs" role="tablist" aria-label="Estado de descarga">
      {tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={`downloads-filter-tab ${activeTab === tab.id ? "is-active" : ""}`} onClick={() => onTabChange(tab.id)}><span>{tab.label}</span><span className="downloads-filter-tab__count">{counts[tab.countKey]}</span></button>)}
    </div>
    <div className="downloads-filters__tools">
      <label className="downloads-search"><Search size={19} aria-hidden="true" /><span className="sr-only">Buscar temas para descargar</span><input type="search" value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar por título o Senda" />{searchQuery && <button type="button" onClick={() => onSearchChange("")} aria-label="Limpiar búsqueda"><X size={17} /></button>}</label>
      <label className="downloads-sort"><span>Ordenar</span><select value={sortOrder} onChange={(event) => onSortChange(event.target.value as OrdenDescarga)}><option value="recientes">Más recientes</option><option value="nombre">Nombre</option><option value="tamano">Mayor tamaño</option></select></label>
    </div>
  </section>;
}
