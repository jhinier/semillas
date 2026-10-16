import { useEffect } from "react";

type ViewportVisual = Pick<VisualViewport, "height" | "offsetTop">;

export function obtenerVariablesViewportVisible(
  viewport: ViewportVisual | null,
  alturaVentana: number,
): { altura: string; desplazamientoSuperior: string } {
  return {
    altura: `${Math.round(viewport?.height ?? alturaVentana)}px`,
    desplazamientoSuperior: `${Math.round(viewport?.offsetTop ?? 0)}px`,
  };
}

export function useVisualViewport(): void {
  useEffect(() => {
    const viewport = window.visualViewport;
    let frame = 0;

    const actualizar = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const { altura, desplazamientoSuperior } = obtenerVariablesViewportVisible(
          viewport,
          window.innerHeight,
        );
        document.documentElement.style.setProperty("--app-height", altura);
        document.documentElement.style.setProperty("--app-offset-top", desplazamientoSuperior);
      });
    };

    actualizar();
    viewport?.addEventListener("resize", actualizar);
    viewport?.addEventListener("scroll", actualizar);
    window.addEventListener("resize", actualizar);
    window.addEventListener("orientationchange", actualizar);

    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener("resize", actualizar);
      viewport?.removeEventListener("scroll", actualizar);
      window.removeEventListener("resize", actualizar);
      window.removeEventListener("orientationchange", actualizar);
    };
  }, []);
}
