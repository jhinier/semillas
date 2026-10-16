import { createFileRoute } from "@tanstack/react-router";
import { AdminClubDetailPage } from "@/features/admin/componentes/clubes-admin/admin-club-detail-page";

export const Route = createFileRoute("/admin/clubes/$clubId")({
  component: AdminClubDetailRoute,
});

function AdminClubDetailRoute() {
  const { clubId } = Route.useParams();
  return <AdminClubDetailPage clubId={clubId} />;
}
