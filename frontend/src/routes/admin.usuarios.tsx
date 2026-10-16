import { useState } from "react";
import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, MailPlus, UserRoundPlus, Users } from "lucide-react";
import { toast } from "sonner";

import { accionMasivaUsuariosAdmin } from "@/features/admin/admin.api";
import {
  AdminNewUserDialog,
  AdminUsersFilters,
  AdminUsersSummary,
  AdminUsersTable,
} from "@/features/admin/componentes/usuarios";
import { useAdminUsers } from "@/features/admin/hooks/use-admin-users";
import "./admin-users-studio.css";

export const Route = createFileRoute("/admin/usuarios")({
  component: AdminUsuariosPage,
});

function AdminUsuariosPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isExact = location.pathname === "/admin/usuarios";
  const queryClient = useQueryClient();
  const [dialogMode, setDialogMode] = useState<"invite" | "child" | null>(null);
  const users = useAdminUsers();

  if (!isExact) return <Outlet />;

  const bulkMutation = useMutation({
    mutationFn: (accion: "activar" | "desactivar") =>
      accionMasivaUsuariosAdmin(users.seleccionadosIds, accion),
    onSuccess: async (resultado) => {
      toast.success(`${resultado.actualizados} usuarios actualizados`);
      users.limpiarSeleccion();
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "No se pudo completar la acción"),
  });

  return (
    <div className="admin-users-page">
      <header className="admin-users-page-header">
        <div className="admin-users-page-header__icon">
          <Users size={25} />
        </div>
        <div>
          <span>Administración de acceso</span>
          <h1>Usuarios</h1>
          <p>Gestiona cuentas, perfiles, clubes, vínculos familiares y permisos.</p>
        </div>
        <div className="admin-users-page-header__actions">
          <button type="button" className="secondary" onClick={() => navigate({ to: "/admin/usuarios/new" })}>
            <ArrowRight size={17} /> Crear usuario
          </button>
          <button type="button" className="secondary" onClick={() => setDialogMode("child")}> 
            <UserRoundPlus size={17} />
            Registrar menor
          </button>
          <button type="button" className="primary" onClick={() => setDialogMode("invite")}>
            <MailPlus size={17} />
            Invitar usuario
          </button>
        </div>
      </header>

      <AdminUsersSummary stats={users.resumen} />

      <AdminUsersFilters
        searchValue={users.searchValue}
        onSearchChange={users.setSearchValue}
        selectedRol={users.selectedRol}
        onRolChange={users.setSelectedRol}
        selectedFranja={users.selectedFranja}
        onFranjaChange={users.setSelectedFranja}
        selectedEstado={users.selectedEstado}
        onEstadoChange={users.setSelectedEstado}
        selectedClub={users.selectedClub}
        onClubChange={users.setSelectedClub}
        catalogos={users.catalogos}
        tieneFiltros={users.tieneFiltros}
        onClear={users.clearFilters}
      />

      {users.seleccionadosIds.length ? (
        <aside className="admin-users-bulk-bar" aria-label="Acciones masivas">
          <strong>{users.seleccionadosIds.length} seleccionados</strong>
          <span>Las acciones se aplicarán a todas las cuentas marcadas.</span>
          <div>
            <button
              type="button"
              onClick={() => bulkMutation.mutate("activar")}
              disabled={bulkMutation.isPending}
            >
              Activar
            </button>
            <button
              type="button"
              className="danger"
              onClick={() => {
                if (window.confirm("¿Desactivar las cuentas seleccionadas?")) {
                  bulkMutation.mutate("desactivar");
                }
              }}
              disabled={bulkMutation.isPending}
            >
              Desactivar
            </button>
            <button type="button" className="ghost" onClick={users.limpiarSeleccion}>
              Cancelar selección
            </button>
          </div>
        </aside>
      ) : null}

      <AdminUsersTable
        usuarios={users.usuarios}
        totalResultados={users.total}
        isLoading={users.isLoading}
        isFetching={users.isFetching}
        isError={users.isError}
        errorMensaje={(users.error as Error)?.message}
        onReintentar={() => users.refetch()}
        paginaActual={users.paginaActual}
        porPagina={users.porPagina}
        onCambiarPagina={users.setPaginaActual}
        onCambiarPorPagina={users.setPorPagina}
        seleccionados={users.seleccionados}
        todosSeleccionados={users.todosSeleccionados}
        onToggleUsuario={users.toggleUsuario}
        onTogglePagina={users.togglePagina}
        onView={(userId) =>
          navigate({ to: "/admin/usuarios/$userId", params: { userId } })
        }
        onEdit={(userId) =>
          navigate({ to: "/admin/usuarios/$userId", params: { userId } })
        }
      />

      <AdminNewUserDialog
        open={dialogMode !== null}
        mode={dialogMode ?? "invite"}
        catalogos={users.catalogos}
        onClose={() => setDialogMode(null)}
      />
    </div>
  );
}
