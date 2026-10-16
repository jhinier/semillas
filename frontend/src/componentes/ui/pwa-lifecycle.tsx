import { useEffect } from "react";
import { toast } from "sonner";

export function PwaLifecycle() {
  useEffect(() => {
    let cancelado = false;

    void import("virtual:pwa-register")
      .then(({ registerSW }) => {
        if (cancelado) return;

        const actualizarServiceWorker = registerSW({
          immediate: true,
          onOfflineReady() {
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
