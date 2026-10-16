import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VARIABLES_PUBLICAS_REQUERIDAS = [
  "VITE_API_URL",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
] as const;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  for (const nombre of VARIABLES_PUBLICAS_REQUERIDAS) {
    if (!env[nombre]?.trim()) {
      throw new Error(`[semillas] Falta la variable de entorno ${nombre}`);
    }
  }

  return {
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routeFileIgnorePattern: "\\.test\\."
    }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
        type: "classic",
        navigateFallback: "index.html",
      },
      includeAssets: ["icons/*.svg", "icons/*.png"],
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "/index.html",
        // El contenido pesado se descarga bajo demanda y se guarda en caches runtime/IndexedDB.
        globPatterns: ["**/*.{js,css,html,ico,json,svg,woff,woff2}"],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/__offline_media/"),
            handler: "CacheOnly",
            options: { cacheName: "semillas-offline-media-v1" },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "semillas-runtime-images-v1",
              expiration: { maxEntries: 180, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "font",
            handler: "CacheFirst",
            options: {
              cacheName: "semillas-runtime-fonts-v1",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === "audio" || request.destination === "video",
            handler: "CacheFirst",
            options: {
              cacheName: "semillas-runtime-av-v1",
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url, request }) =>
              request.method === "GET" &&
              !url.pathname.includes("/administracion/") &&
              !url.pathname.includes("/admin/") &&
              /\/(temas|sendas|catalogo)(\/|$)/.test(url.pathname),
            handler: "NetworkFirst",
            options: {
              cacheName: "semillas-public-api-v1",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url, request }) =>
              request.method === "GET" &&
              !url.pathname.includes("/administracion/") &&
              !url.pathname.includes("/admin/") &&
              /\/(perfil|progreso|gamificacion|actividades|clubes)(\/|$)/.test(url.pathname),
            handler: "NetworkFirst",
            options: {
              cacheName: "semillas-user-api-v1",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        id: "/",
        lang: "es",
        name: "Semillas",
        short_name: "Semillas",
        description: "Plataforma cristiana de aprendizaje para niños y adolescentes",
        theme_color: "#2E9E5B",
        background_color: "#F7F4EC",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        categories: ["education", "kids"],
        icons: [
          {
            src: "/icons/logo_original.webp",
            sizes: "512x512",
            type: "image/webp",
            purpose: "any"
          },
          {
            src: "/icons/icon-512.svg",
            sizes: "512x512",
            purpose: "any"
          },
          {
            src: "/icons/maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/icons/icon-192.svg",
            sizes: "192x192",
            purpose: "any"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react-dom") || (id.includes("node_modules/react") && !id.includes("node_modules/react-"))) {
            return "vendor-react";
          }
          if (id.includes("node_modules/@tanstack")) {
            return "vendor-tanstack";
          }
        },
      },
    },
  },
    server: {
      port: 5173
    }
  };
});
