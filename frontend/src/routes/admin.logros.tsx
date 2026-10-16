import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { AdminLogrosPanel } from "@/features/admin/componentes/logros-admin";

export const Route = createFileRoute("/admin/logros")({
  component: AdminLogrosPage,
});

function AdminLogrosPage() {
  const location = useLocation();
  const esListado = location.pathname === "/admin/logros" || location.pathname === "/admin/logros/";

  return esListado ? <AdminLogrosPanel /> : <Outlet />;
}
