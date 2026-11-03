import { useEffect } from "react";
import { toast } from "sonner";

async function calentarCacheAppShell() {
  if (typeof window === "undefined" || !("caches" in window) || !navigator.onLine) {
    return;
  }

  try {
    const [navCache, codeCache] = await Promise.all([
      caches.open("semillas-navigation-shell-v1"),
      caches.open("semillas-app-code-v1"),
    ]);

    // Guardar el documento HTML base para recargas (F5) sin conexión
    await Promise.allSettled([
      navCache.add("/"),
      navCache.add("/index.html"),
      navCache.add(window.location.pathname),
    ]);

    // Guardar todos los scripts, hojas de estilo y módulos de Vite ya cargados en la pestaña actual
    const recursos = performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((url) => {
        try {
          const parsed = new URL(url, window.location.origin);
          if (parsed.origin !== window.location.origin) return false;
          return (
            parsed.pathname.startsWith("/src/") ||
            parsed.pathname.startsWith("/node_modules/") ||
            parsed.pathname.startsWith("/@") ||
            parsed.pathname.startsWith("/assets/") ||
            parsed.pathname.endsWith(".js") ||
            parsed.pathname.endsWith(".ts") ||
            parsed.pathname.endsWith(".tsx") ||
            parsed.pathname.endsWith(".css")
          );
        } catch {
          return false;
        }
      });

    const urlsUnicas = new Set<string>([
      ...recursos,
      ...(import.meta.env.DEV ? ["/@vite/client", "/src/main.tsx"] : []),
    ]);

    await Promise.allSettled(
      Array.from(urlsUnicas).map(async (url) => {
        const yaExiste = await codeCache.match(url);
        if (!yaExiste) {
          const res = await fetch(url, { credentials: "same-origin" });
          if (res.ok) {
            await codeCache.put(url, res.clone());
          }
        }
      }),
    );
  } catch {
    // No interrumpir si el navegador restringe CacheStorage
  }
}

export function PwaLifecycle() {
  useEffect(() => {
    let cancelado = false;

    void import("virtual:pwa-register")
      .then(({ registerSW }) => {
        if (cancelado) return;

        const actualizarServiceWorker = registerSW({
          immediate: true,
          onRegisteredSW() {
            void calentarCacheAppShell();
          },
          onOfflineReady() {
            void calentarCacheAppShell();
            toast.success("Semillas está lista para abrirse sin conexión.");
          },
          onNeedRefresh() {
            toast("Hay una nueva versión de Semillas", {
              duration: Infinity,
              action: {
                label: "Actualizar",
                onClick: () => void actualizarServiceWorker(true),
              },
            });
          },
        });
      })
      .catch(() => undefined);

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.ready.then(() => {
        if (!cancelado) void calentarCacheAppShell();
      });
    }

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    const onLogros = (event: Event) => {
      const detalle = (event as CustomEvent<Array<{ nombre: string; bono_xp: number }>>).detail ?? [];
      for (const logro of detalle) {
        toast.success(`¡Nueva insignia: ${logro.nombre}!`, {
          description: logro.bono_xp > 0 ? `Ganaste ${logro.bono_xp} XP extra.` : "Tu progreso ya fue sincronizado.",
        });
      }
    };
    window.addEventListener("semillas:logros-desbloqueados", onLogros);
    return () => window.removeEventListener("semillas:logros-desbloqueados", onLogros);
  }, []);

  return null;
}
