import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
} from "@tanstack/react-router";
import { AppTopbar } from "./app-topbar";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const crearRouter = () => {
  const rootRoute = createRootRoute();

  const rutaApp = createRoute({
    getParentRoute: () => rootRoute,
    path: "/app",
    component: () => (
      <AppTopbar
        title="Mis Temas"
        subtitle="Continúa tu camino de fe"
        onOpenSidebar={() => {}}
        onLogout={() => {}}
      />
    ),
  });

  const routeTree = rootRoute.addChildren([rutaApp]);

  return createRouter({
    routeTree,
    defaultNotFoundComponent: () => null,
    history: createMemoryHistory({ initialEntries: ["/app"] }),
  });
};

const DecoradorRouterQuery = (Story: React.FC) => (
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={crearRouter()} />
  </QueryClientProvider>
);

const meta = {
  title: "Shared/Layout/App Topbar",
  component: AppTopbar,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  decorators: [DecoradorRouterQuery],
} satisfies Meta<typeof AppTopbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Mis Temas",
    subtitle: "Continúa tu camino de fe",
    onOpenSidebar: () => {},
    onLogout: () => {},
  },
};
