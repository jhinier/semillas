import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, MailPlus, UserRoundPlus } from "lucide-react";

import { AdminNewUserDialog } from "@/features/admin/componentes/usuarios";
import { obtenerUsuariosAdmin } from "@/features/admin/admin.api";

export const Route = createFileRoute("/admin/usuarios/new")({ component: AdminUsersNewPage });

function AdminUsersNewPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"invite" | "child">("invite");
  const query = useQuery({
    queryKey: ["admin", "users", "catalogs"],
    queryFn: () => obtenerUsuariosAdmin({ limit: 1, offset: 0 }),
  });

  return (
    <div className="admin-users-page">
      <header className="admin-users-page-header">
        <button type="button" className="secondary" onClick={() => navigate({ to: "/admin/usuarios" })}>
          <ArrowLeft size={17} /> Volver
        </button>
        <div>
          <span>Administración de acceso</span>
          <h1>Crear usuario</h1>
          <p>Invita una cuenta o registra un menor desde un formulario dedicado.</p>
        </div>
        <div className="admin-users-page-header__actions">
          <button type="button" className="secondary" onClick={() => setModo("child")}>
            <UserRoundPlus size={17} /> Registrar menor
          </button>
          <button type="button" className="primary" onClick={() => setModo("invite")}>
            <MailPlus size={17} /> Invitar usuario
          </button>
        </div>
      </header>

      {query.data ? (
        <AdminNewUserDialog
          open
          mode={modo}
          catalogos={query.data.catalogos}
          onClose={() => navigate({ to: "/admin/usuarios" })}
        />
      ) : (
        <div className="admin-dashboard-state">
          <span><UserRoundPlus /></span>
          <h2>Cargando formulario</h2>
          <p>Preparando catálogos de usuarios.</p>
        </div>
      )}
    </div>
  );
}
