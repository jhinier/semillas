import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { AdminClubesPanel, ReportesClubAdmin } from "@/features/admin/componentes/clubes-admin";

export const Route = createFileRoute("/admin/clubes")({
  component: AdminClubesPage,
});

function AdminClubesPage() {
  const location = useLocation();
  const esListado = location.pathname === "/admin/clubes" || location.pathname === "/admin/clubes/";
  return esListado ? <><ReportesClubAdmin /><AdminClubesPanel /></> : <Outlet />;
}
