import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  createMemoryHistory,
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
} from "@tanstack/react-router";
import { AppSidebar } from "./app-sidebar";

const crearRouter = (activePage: string, variant: "app" | "admin" = "app") => {
  const rootRoute = createRootRoute();

  const renderSidebar = () => (
    <AppSidebar
      activePage={activePage}
      isOffline={false}
      isOpen={true}
      onClose={() => {}}
      onLogout={() => {}}
      variant={variant}
    />
  );

  const rutaApp = createRoute({
    getParentRoute: () => rootRoute,
    path: "/app",
    component: renderSidebar,
  });

  const rutaTemas = createRoute({
    getParentRoute: () => rootRoute,
    path: "/app/temas",
    component: renderSidebar,
  });

  const rutaAdmin = createRoute({
    getParentRoute: () => rootRoute,
    path: "/admin",
    component: renderSidebar,
  });

  const routeTree = rootRoute.addChildren([rutaApp, rutaTemas, rutaAdmin]);

  return createRouter({
    routeTree,
    defaultNotFoundComponent: () => null,
    history: createMemoryHistory({ initialEntries: [activePage] }),
  });
};

const meta = {
  title: "Shared/Layout/App Sidebar",
  component: AppSidebar,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof AppSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InicioActivo: Story = {
  args: {
    activePage: "/app",
    isOffline: false,
    isOpen: true,
    onClose: () => {},
    onLogout: () => {},
    variant: "app",
  },
  render: () => <RouterProvider router={crearRouter("/app")} />,
};

export const TemasActivo: Story = {
  args: {
    activePage: "/app/temas",
    isOffline: false,
    isOpen: true,
    onClose: () => {},
    onLogout: () => {},
    variant: "app",
  },
  render: () => <RouterProvider router={crearRouter("/app/temas")} />,
};

export const AdminActivo: Story = {
  args: {
    activePage: "/admin",
    isOffline: false,
    isOpen: true,
    onClose: () => {},
    onLogout: () => {},
    variant: "admin",
  },
  render: () => <RouterProvider router={crearRouter("/admin", "admin")} />,
};
