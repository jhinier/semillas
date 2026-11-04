import { useEffect } from "react";
import { Outlet, createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
import { AppSidebar } from "../shared/layout/app-sidebar";
import { AppTopbar } from "../shared/layout/app-topbar";
import { useAdminLayout } from "../features/admin/hooks/use-admin-layout";
import { obtenerMiPerfil } from "../features/perfil/profile.api";
import { sessionStorageApi } from "../shared/api/session";
import { resolverAccesoAdmin } from "../shared/auth/admin-access";
import { queryClient } from "../app/query-client";
import "./app.css";
import "./admin-content-studio.css";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    try {
      const { usuario } = await queryClient.fetchQuery({
        queryKey: ["me"],
        queryFn: obtenerMiPerfil,
      });
      const acceso = resolverAccesoAdmin(usuario);

      if (!acceso.permitido) {
        if (acceso.redireccion === "/login" || usuario.rol === "invitado") {
          throw redirect({ to: "/login", search: { redirect: location.href } });
        }
        throw redirect({ to: "/acceso-denegado" });
      }
    } catch (error) {
      if (isRedirect(error)) throw error;
      throw redirect({
        to: "/login",
        search: { redirect: location.href, reason: "backend_unavailable" },
      });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { sidebarOpen, closeSidebar, openSidebar, handleLogout, pageHeader, activePage } = useAdminLayout();

  useEffect(() => {
    const aplicarTemaAdmin = () => {
      const tema = window.localStorage.getItem("semillas-pref-tema") || "claro";
      let esOscuro = false;
      if (tema === "oscuro") {
        esOscuro = true;
      } else if (tema === "sistema") {
        esOscuro = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
      }

      document.documentElement.setAttribute("data-theme", esOscuro ? "admin-dark" : "admin-light");
      if (esOscuro) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    aplicarTemaAdmin();

    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const tema = window.localStorage.getItem("semillas-pref-tema") || "claro";
      if (tema === "sistema") {
        aplicarTemaAdmin();
      }
    };
    mediaQuery?.addEventListener?.("change", handleChange);

    return () => {
      mediaQuery?.removeEventListener?.("change", handleChange);
      const appTema = window.localStorage.getItem("semillas-pref-tema") || "claro";
      let appOscuro = false;
      if (appTema === "oscuro") {
        appOscuro = true;
      } else if (appTema === "sistema") {
        appOscuro = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
      }
      document.documentElement.setAttribute("data-theme", appOscuro ? "app-dark" : "app-light");
      if (appOscuro) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
  }, []);

  return (
    <div className="app-shell app-shell--admin">
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
