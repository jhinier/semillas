import { useEffect, type RefObject } from "react";

const SELECTORES_FOCUS = "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

export function useDialogAccessibility(ref: RefObject<HTMLElement | null>, onClose: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const anterior = document.activeElement as HTMLElement | null;
    const focoInicial = ref.current?.querySelector<HTMLElement>(SELECTORES_FOCUS);
    focoInicial?.focus();
    const manejarTecla = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !ref.current) return;
      const focables = Array.from(ref.current.querySelectorAll<HTMLElement>(SELECTORES_FOCUS));
      if (focables.length === 0) return;
      const primero = focables[0];
      const ultimo = focables[focables.length - 1];
      if (!primero || !ultimo) return;
      if (event.shiftKey && document.activeElement === primero) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener("keydown", manejarTecla);
    return () => {
      document.removeEventListener("keydown", manejarTecla);
      anterior?.focus();
    };
  }, [enabled, onClose, ref]);
}
