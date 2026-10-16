import { SelectFiltro } from "@/componentes/ui/select-filtro";
import { Boton } from "@/componentes/ui/boton";
import type { Tema, Senda, GrupoEdad } from "@/shared/api/api";

export type AdminActivitiesFiltersProps = {
  searchValue: string;
  onSearchChange: (val: string) => void;
  selectedTemaId: string;
  onTemaChange: (val: string) => void;
  temasBase: Tema[];
  selectedSendaId: string;
  onSendaChange: (val: string) => void;
  sendasBase: Senda[];
  selectedAgeGroupId: string;
  onAgeGroupChange: (val: string) => void;
  ageGroupsBase: GrupoEdad[];
  onClear: () => void;
  tieneFiltros: boolean;
};

export function AdminActivitiesFilters({
  searchValue,
  onSearchChange,
  selectedTemaId,
  onTemaChange,
  temasBase,
  selectedSendaId,
  onSendaChange,
  sendasBase,
  selectedAgeGroupId,
  onAgeGroupChange,
  ageGroupsBase,
  onClear,
  tieneFiltros,
}: AdminActivitiesFiltersProps) {
  const temasOpciones = temasBase.map((t) => ({ id: t.id, nombre: t.titulo }));

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(14rem,1.6fr)_repeat(3,minmax(10rem,1fr))_auto] xl:items-center">
      <div className="relative min-w-0">
        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          type="text"
          placeholder="Buscar actividades..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-200 bg-slate-50 font-semibold text-[13px] text-slate-800 placeholder-slate-400 focus:border-green-600 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-green-600/10 transition-all"
        />
      </div>

      <div className="min-w-0">
        <SelectFiltro
          opciones={temasOpciones}
          placeholder="Todos los temas"
          etiquetaAria="Filtrar por tema"
          value={selectedTemaId}
          onChange={(e) => onTemaChange(e.target.value)}
        />
      </div>

      <div className="min-w-0">
        <SelectFiltro
          opciones={sendasBase}
          placeholder="Todas las sendas"
          etiquetaAria="Filtrar por senda"
          value={selectedSendaId}
          onChange={(e) => onSendaChange(e.target.value)}
        />
      </div>

      <div className="min-w-0">
        <SelectFiltro
          opciones={ageGroupsBase}
          placeholder="Todas las franjas"
          etiquetaAria="Filtrar por franja de edad"
          value={selectedAgeGroupId}
          onChange={(e) => onAgeGroupChange(e.target.value)}
        />
      </div>

      {tieneFiltros && (
        <Boton
          variante="contorno"
          tamano="pequeno"
          forma="pildora"
          onClick={onClear}
        >
          Limpiar filtros
        </Boton>
      )}
    </div>
  );
}
