import { Search, SlidersHorizontal, X } from "lucide-react";

import type { CatalogosUsuariosAdmin, EstadoUsuarioAdmin } from "../../admin.api";

type Props = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedRol: string;
  onRolChange: (value: string) => void;
  selectedFranja: string;
  onFranjaChange: (value: string) => void;
  selectedEstado: EstadoUsuarioAdmin | "";
  onEstadoChange: (value: string) => void;
  selectedClub: string;
  onClubChange: (value: string) => void;
  catalogos: CatalogosUsuariosAdmin;
  tieneFiltros: boolean;
  onClear: () => void;
};

export function AdminUsersFilters({
  searchValue,
  onSearchChange,
  selectedRol,
  onRolChange,
  selectedFranja,
  onFranjaChange,
  selectedEstado,
  onEstadoChange,
  selectedClub,
  onClubChange,
  catalogos,
  tieneFiltros,
  onClear,
}: Props) {
  return (
    <section className="admin-users-filters" aria-label="Filtros de usuarios">
      <div className="admin-users-search">
        <Search size={17} aria-hidden="true" />
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nombre o correo"
          aria-label="Buscar usuarios"
        />
        {searchValue ? (
          <button type="button" onClick={() => onSearchChange("")} aria-label="Limpiar búsqueda">
            <X size={15} />
          </button>
        ) : null}
      </div>

      <label>
        <span className="sr-only">Rol</span>
        <select value={selectedRol} onChange={(event) => onRolChange(event.target.value)}>
          <option value="">Todos los roles</option>
          <option value="administrador">Administradores</option>
          <option value="usuario">Estudiantes</option>
          <option value="invitado">Invitados</option>
        </select>
      </label>

      <label>
        <span className="sr-only">Franja</span>
        <select value={selectedFranja} onChange={(event) => onFranjaChange(event.target.value)}>
          <option value="">Todas las franjas</option>
          {catalogos.grupos_edad.map((grupo) => (
            <option key={grupo.id} value={grupo.id}>
              {grupo.nombre} ({grupo.edad_minima}–{grupo.edad_maxima})
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">Estado</span>
        <select value={selectedEstado} onChange={(event) => onEstadoChange(event.target.value)}>
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="pendiente">Invitación pendiente</option>
          <option value="bloqueado">Bloqueados</option>
        </select>
      </label>

      <label>
        <span className="sr-only">Club</span>
        <select value={selectedClub} onChange={(event) => onClubChange(event.target.value)}>
          <option value="">Todos los clubes</option>
          {catalogos.clubes.map((club) => (
            <option key={club.id} value={club.id}>
              {club.nombre}
            </option>
          ))}
        </select>
      </label>

      {tieneFiltros ? (
        <button type="button" className="admin-users-filter-clear" onClick={onClear}>
          <SlidersHorizontal size={15} />
          Limpiar
        </button>
      ) : null}
    </section>
  );
}
