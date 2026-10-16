import { AlertCircle, RefreshCw, Users } from "lucide-react";

import { Paginacion } from "@/componentes/ui/paginacion";
import type { UsuarioAdmin } from "../../admin.api";
import { FilaUsuario } from "./user-table-row";

type Props = {
  usuarios: UsuarioAdmin[];
  totalResultados: number;
  isLoading: boolean;
  isFetching?: boolean;
  isError?: boolean;
  errorMensaje?: string;
  onReintentar?: () => void;
  paginaActual: number;
  porPagina: number;
  onCambiarPagina: (pagina: number) => void;
  onCambiarPorPagina: (cantidad: number) => void;
  seleccionados: Set<string>;
  todosSeleccionados: boolean;
  onToggleUsuario: (usuarioId: string) => void;
  onTogglePagina: () => void;
  onView: (usuarioId: string) => void;
  onEdit: (usuarioId: string) => void;
};

export function AdminUsersTable({
  usuarios,
  totalResultados,
  isLoading,
  isFetching,
  isError,
  errorMensaje,
  onReintentar,
  paginaActual,
  porPagina,
  onCambiarPagina,
  onCambiarPorPagina,
  seleccionados,
  todosSeleccionados,
  onToggleUsuario,
  onTogglePagina,
  onView,
  onEdit,
}: Props) {
  if (isError) {
    return (
      <section className="admin-users-state admin-users-state--error">
        <AlertCircle size={28} />
        <div>
          <strong>No se pudieron cargar los usuarios</strong>
          <p>{errorMensaje || "Verifica la conexión y los permisos del administrador."}</p>
        </div>
        {onReintentar ? (
          <button type="button" onClick={onReintentar}>
            <RefreshCw size={16} />
            Reintentar
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <section className="admin-users-table-card" aria-busy={isFetching}>
      <header className="admin-users-table-card__header">
        <div>
          <span>Directorio</span>
          <strong>{totalResultados.toLocaleString("es-EC")} usuarios</strong>
        </div>
        {isFetching && !isLoading ? <small>Actualizando…</small> : null}
      </header>

      <div className="admin-users-table-wrap">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th className="admin-users-table__check">
                <input
                  type="checkbox"
                  checked={todosSeleccionados}
                  onChange={onTogglePagina}
                  aria-label="Seleccionar usuarios de esta página"
                />
              </th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Franja</th>
              <th>Club y vínculos</th>
              <th>Progreso</th>
              <th>Estado</th>
              <th>Último acceso</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 7 }, (_, index) => (
                  <tr key={index} className="admin-users-skeleton">
                    <td colSpan={9}>
                      <span />
                    </td>
                  </tr>
                ))
              : usuarios.map((usuario) => (
                  <FilaUsuario
                    key={usuario.id}
                    usuario={usuario}
                    selected={seleccionados.has(usuario.id)}
                    onToggle={() => onToggleUsuario(usuario.id)}
                    onView={() => onView(usuario.id)}
                    onEdit={() => onEdit(usuario.id)}
                  />
                ))}
          </tbody>
        </table>
      </div>

      {!isLoading && usuarios.length === 0 ? (
        <div className="admin-users-state">
          <Users size={30} />
          <strong>No hay usuarios que coincidan</strong>
          <p>Prueba con otros filtros o registra un nuevo usuario.</p>
        </div>
      ) : null}

      {!isLoading && totalResultados > 0 ? (
        <Paginacion
          total={totalResultados}
          paginaActual={paginaActual}
          porPagina={porPagina}
          onCambiarPagina={onCambiarPagina}
          onCambiarPorPagina={onCambiarPorPagina}
          opcionesPorPagina={[10, 20, 50]}
          className="admin-users-pagination"
        />
      ) : null}
    </section>
  );
}

export type UserTableRow = UsuarioAdmin;
