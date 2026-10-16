import { createFileRoute } from "@tanstack/react-router";
import { PanelAdministracion } from "@/features/admin/componentes/dashboard/panel-admin";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage
});

function AdminDashboardPage() {
  return <PanelAdministracion />;
}
