/// <reference types="vite/client" />

import type { Preview } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import "../src/styles.css";
import "../src/routes/app.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Number.POSITIVE_INFINITY,
    },
    mutations: { retry: false },
  },
});

const viewports = {
  movilCompacto: {
    name: "Móvil compacto · 360 × 800",
    styles: { width: "360px", height: "800px" },
    type: "mobile",
  },
  movilApp: {
    name: "Móvil app · 390 × 844",
    styles: { width: "390px", height: "844px" },
    type: "mobile",
  },
  movilAndroid: {
    name: "Android · 412 × 915",
    styles: { width: "412px", height: "915px" },
    type: "mobile",
  },
  tablet: {
    name: "Tablet · 768 × 1024",
    styles: { width: "768px", height: "1024px" },
    type: "tablet",
  },
  escritorio: {
    name: "Escritorio · 1440 × 900",
    styles: { width: "1440px", height: "900px" },
    type: "desktop",
  },
};

const preview: Preview = {
  tags: ["autodocs"],
  initialGlobals: {
    viewport: { value: "escritorio", isRotated: false },
    backgrounds: { value: "crema", grid: false },
  },
  decorators: [
    (Story) => createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(Story),
    ),
  ],
  parameters: {
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        crema: { name: "Crema", value: "#F7F4EC" },
        blanco: { name: "Blanco", value: "#ffffff" },
        grisApp: { name: "Gris app", value: "#f8fafc" },
        verdeProfundo: { name: "Verde profundo", value: "#123B2C" },
      },
    },
    viewport: {
      options: viewports,
    },
    layout: "padded",
    options: {
      storySort: {
        order: [
          "Pantallas",
          "Páginas",
          "Features",
          "Shared",
          "UI",
          "Componentes",
          "Fundamentos",
        ],
      },
    },
  },
};

export default preview;
