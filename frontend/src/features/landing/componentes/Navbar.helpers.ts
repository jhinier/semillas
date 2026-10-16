export function obtenerHrefLandingInicial(): string {
  if (typeof window === "undefined") return "#top";

  return window.location?.hash || "#top";
}

export function esEnlaceLandingActivo(hrefActivo: string, hrefEnlace: string): boolean {
  return hrefActivo === hrefEnlace;
}

export function crearScrollSpy(
  secciones: string[],
  alCambiarSeccion: (seccion: string) => void
): () => void {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          alCambiarSeccion(`#${entry.target.id}`);
          break;
        }
      }
    },
    {
      rootMargin: "-40% 0px -50% 0px",
      threshold: 0,
    }
  );

  for (const seccion of secciones) {
    const id = seccion.replace("#", "");
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  }

  return () => observer.disconnect();
}
