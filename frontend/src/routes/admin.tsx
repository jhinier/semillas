import { useEffect } from "react";
import { Outlet, createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
import { AppSidebar } from "../shared/layout/app-sidebar";
import { AppTopbar } from "../shared/layout/app-topbar";
import { useAdminLayout } from "../features/admin/hooks/use-admin-layout";
import { obtenerMiPerfil } from "../features/perfil/profile.api";
import { sessionStorageApi } from "../shared/api/session";
import { resolverAccesoAdmin } from "../shared/auth/admin-access";
import { queryClient } from "../app/query-client";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    try {
      const { usuario } = await queryClient.ensureQueryData({
        queryKey: ["me"],
        queryFn: obtenerMiPerfil,
      });
      const acceso = resolverAccesoAdmin(usuario);

      if (!acceso.permitido) {
        if (acceso.redireccion === "/login") {
          throw redirect({ to: "/login", search: { redirect: location.href } });
        }
        throw redirect({ to: "/acceso-denegado" });
      }
    } catch (error) {
      if (isRedirect(error)) throw error;
      sessionStorageApi.clearGuestSession();
      sessionStorageApi.clearAccessToken();
      throw redirect({
        to: "/login",
        search: { redirect: location.href, reason: "backend_unavailable" },
      });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  useEffect(() => {
    void Promise.all([import("./app.css"), import("./admin-content-studio.css")]);
  }, []);

  const { sidebarOpen, closeSidebar, openSidebar, handleLogout, pageHeader, activePage } = useAdminLayout();

  useEffect(() => {
    // Tema oscuro temporalmente deshabilitado
    document.documentElement.setAttribute("data-theme", "admin-light");
  }, []);

  return (
    <div className="app-shell app-shell--admin" data-theme="admin-light">
      <AppSidebar
        activePage={activePage}
        variant="admin"
        isOffline={false}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        onLogout={handleLogout}
      />

      <a className="skip-link" href="#main-content">Ir al contenido</a>
      <main id="main-content" className="app-shell__main app-shell__main--admin">
        <AppTopbar
          title={pageHeader.titulo}
          subtitle={pageHeader.subtitulo}
          onOpenSidebar={openSidebar}
          onLogout={handleLogout}
          showMenuButton={false}
        />

        <div className="app-shell__content app-shell__content--admin">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
