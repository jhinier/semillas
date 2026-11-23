import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Resuelve en cliente el contenedor raíz del shell admin tras montar el componente
 * para portalar modales sobre la barra lateral (`z-[110]`) sin romper SSR ni
 * depender de objetos `document` parciales en pruebas unitarias.
 */
export function useContenedorModalAdmin(): Element | null {
  const [contenedor, setContenedor] = useState<Element | null>(null);

  useEffect(() => {
    if (typeof document === "undefined" || typeof document.querySelector !== "function") {
      return;
    }

    const objetivo = document.querySelector(".app-shell--admin") ?? document.body;
    if (objetivo) {
      setContenedor(objetivo);
    }
  }, []);

  return contenedor;
}

export function renderizarEnCapaModalAdmin(
  contenido: ReactNode,
  contenedor: Element | null,
): ReactNode {
  return contenedor ? createPortal(contenido, contenedor) : contenido;
}
