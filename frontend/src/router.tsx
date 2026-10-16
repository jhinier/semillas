import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { PantallaErrorRuta } from "@/componentes/estados/pantalla-error-ruta";
import { PantallaNoEncontrado } from "@/componentes/estados/pantalla-no-encontrado";

export const router = createRouter({
  routeTree,
  defaultErrorComponent: PantallaErrorRuta,
  defaultNotFoundComponent: PantallaNoEncontrado,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
