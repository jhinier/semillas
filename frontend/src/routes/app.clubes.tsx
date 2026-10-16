import { createFileRoute } from "@tanstack/react-router";
import { ClubesPage } from "@/features/clubes/componentes/clubes-page";

export const Route = createFileRoute("/app/clubes")({
  component: ClubesPage,
});
