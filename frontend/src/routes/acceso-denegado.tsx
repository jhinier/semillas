import { createFileRoute } from "@tanstack/react-router";
import { PantallaAccesoDenegado } from "@/componentes/estados/pantalla-acceso-denegado";

export const Route = createFileRoute("/acceso-denegado")({
  component: PantallaAccesoDenegado,
});
