import type { FC } from "react";
import { Filter, X } from "lucide-react";
import { CampoBusqueda } from "@/componentes/ui/navegacion-tabs";

export interface TemasSearchBarProps {
  valor: string;
  onChange: (v: string) => void;
  onFiltrarClick?: () => void;
}

export const TemasSearchBar: FC<TemasSearchBarProps> = ({
  valor,
  onChange,
  onFiltrarClick,
}) => {
  return (
    <div className="mb-4 flex flex-wrap gap-3 md:mb-6">
      <div className="relative min-w-0 flex-1">
        <CampoBusqueda
          valor={valor}
          onChange={onChange}
          placeholder="Buscar por título o descripción"
          contenedorClassName="w-full"
          inputClassName="h-12 rounded-2xl pr-11 text-[13px] md:text-sm"
        />

        {valor ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-2.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      {onFiltrarClick && (
        <button
          type="button"
          onClick={onFiltrarClick}
          className="flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-neutro-oscuro transition-colors hover:bg-slate-50"
        >
          <Filter className="size-4" />
          <span className="hidden sm:inline">Filtrar</span>
        </button>
      )}
    </div>
  );
};
