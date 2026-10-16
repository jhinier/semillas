import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
} from "@tanstack/react-router";
import { AppAccountMenu } from "./app-account-menu";

const crearRouter = () => {
  const rootRoute = createRootRoute();

  const rutaPerfil = createRoute({
    getParentRoute: () => rootRoute,
    path: "/app/perfil",
    component: () => null,
  });

  const routeTree = rootRoute.addChildren([rutaPerfil]);

  return createRouter({
    routeTree,
    defaultNotFoundComponent: () => null,
    history: {
      push: () => {},
      replace: () => {},
      back: () => {},
      forward: () => {},
      destroy: () => {},
      listen: () => () => {},
      location: { pathname: "/app/perfil", search: "", hash: "" },
    } as any,
  });
};

const ContenedorMenu = () => {
  const [_, setLogeado] = useState(true);
  return (
    <div className="flex justify-end p-4">
      <AppAccountMenu
        nombreVisible="Semillero"
        nivelTexto="Explorador • Nivel 7"
        avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=semillas"
        onLogout={() => setLogeado(false)}
      />
    </div>
  );
};

const meta = {
  title: "Shared/Layout/App Account Menu",
  component: AppAccountMenu,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof AppAccountMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    nombreVisible: "Semillero",
    nivelTexto: "Explorador • Nivel 7",
    avatarUrl: "",
    onLogout: () => {},
  },
  render: () => (
    <RouterProvider router={crearRouter()} />
  ),
};
