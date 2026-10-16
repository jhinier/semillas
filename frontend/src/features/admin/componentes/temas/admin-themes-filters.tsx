import { CampoBusqueda } from "@/componentes/ui/navegacion-tabs";
import { SelectFiltro } from "@/componentes/ui/select-filtro";
import { Boton } from "@/componentes/ui/boton";

type FilterItem = { id: string; nombre: string };

type AdminThemesFiltersProps = {
  searchValue: string;
  onSearchChange: (val: string) => void;
  selectedSendaId: string;
  onSendaChange: (val: string) => void;
  selectedAgeGroupId: string;
  onAgeGroupChange: (val: string) => void;
  sendas: FilterItem[];
  ageGroups: FilterItem[];
  onMasFiltros?: () => void;
};

export function AdminThemesFilters({
  searchValue,
  onSearchChange,
  selectedSendaId,
  onSendaChange,
  selectedAgeGroupId,
  onAgeGroupChange,
  sendas,
  ageGroups,
  onMasFiltros,
}: AdminThemesFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-3 w-full bg-[#142e22] rounded-3xl border border-[#1a3a2a] p-5 shadow-sm select-none">
      <CampoBusqueda
        valor={searchValue}
        onChange={onSearchChange}
        placeholder="Buscar por título o palabra clave..."
        contenedorClassName="flex-1"
        inputClassName="rounded-full pl-10 py-2.5 text-[13px] focus:ring-2 focus:ring-[#2E9E5B]/30 focus:border-[#2E9E5B] placeholder:text-emerald-400/50 placeholder:font-normal"
      />

      <div className="w-full lg:w-48">
        <SelectFiltro
          opciones={sendas}
          placeholder="Todas las sendas"
          etiquetaAria="Filtrar por senda"
          value={selectedSendaId}
          onChange={(e) => onSendaChange(e.target.value)}
        />
      </div>

      <div className="w-full lg:w-48">
        <SelectFiltro
          opciones={ageGroups}
          placeholder="Todas las franjas"
          etiquetaAria="Filtrar por franja de edad"
          value={selectedAgeGroupId}
          onChange={(e) => onAgeGroupChange(e.target.value)}
        />
      </div>

      <Boton
        variante="contorno"
        tamano="pequeno"
        iconoIzquierdo={<i className="fa-solid fa-filter text-xs" />}
        onClick={onMasFiltros}
        deshabilitado={!onMasFiltros}
      >
        Más filtros
      </Boton>
    </div>
  );
}
