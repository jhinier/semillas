import { Outlet, createRootRoute } from "@tanstack/react-router";
import { PantallaNoEncontrado } from "@/componentes/estados/pantalla-no-encontrado";
import { InstalacionPrompt } from "@/features/instalacion";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: PantallaNoEncontrado,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <InstalacionPrompt />
    </>
  );
}
