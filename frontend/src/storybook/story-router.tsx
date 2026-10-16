import type { ReactNode } from "react";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

type StoryRouterProps = {
  children: ReactNode;
  initialPath?: string;
};

export function StoryRouter({ children, initialPath = "/" }: StoryRouterProps) {
  const rootRoute = createRootRoute();
  const storyRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "$",
    component: () => <>{children}</>,
  });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <>{children}</>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, storyRoute]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    defaultNotFoundComponent: () => <>{children}</>,
  });

  return <RouterProvider router={router} />;
}
