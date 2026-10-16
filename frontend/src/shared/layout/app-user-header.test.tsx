import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Outlet, createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from "@tanstack/react-router";

import { AppUserHeader } from "./app-user-header";

function createHeaderRouter() {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const route = createRoute({
    getParentRoute: () => rootRoute,
    path: "/app",
    component: () => (
      <AppUserHeader
        title="Inicio"
        subtitle="Sigue aprendiendo"
        nombreVisible="Andres"
        nivelTexto="Invitado"
        avatarUrl="/avatar.png"
        onLogout={() => undefined}
        isOffline={false}
        esInicio
      />
    ),
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([route]),
    history: createMemoryHistory({ initialEntries: ["/app"] }),
  });

  return router;
}

describe("AppUserHeader", () => {
  it("no duplica la navegación principal del sidebar", async () => {
    const router = createHeaderRouter();
    await router.load();

    const html = renderToStaticMarkup(<RouterProvider router={router} />);

    expect(html).toContain("Inicio");
    expect(html).not.toContain("Mis temas");
    expect(html).not.toContain("Descargas");
  });
});
