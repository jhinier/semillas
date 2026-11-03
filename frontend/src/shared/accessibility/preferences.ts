export const TAMANOS_TEXTO = ["pequeno", "mediano", "grande"] as const;

export type TamanoTexto = (typeof TAMANOS_TEXTO)[number];
export type TemaVisual = "sistema" | "claro" | "oscuro";

export function normalizarTamanoTexto(value?: string | null): TamanoTexto {
  if (value === "pequeno" || value === "pequeño") return "pequeno";
  if (value === "grande") return "grande";
  return "mediano";
}

export function aplicarTamanoTexto(value?: string | null): TamanoTexto {
  const tamano = normalizarTamanoTexto(value);

  if (typeof document !== "undefined") {
    document.documentElement.dataset.semillasTextSize = tamano;
  }

  return tamano;
}

export function aplicarContraste(altoContraste?: boolean | string | null): boolean {
  const activo = altoContraste === true || altoContraste === "alto" || altoContraste === "true";
  if (typeof document !== "undefined") {
    if (activo) {
      document.documentElement.classList.add("alto-contraste");
    } else {
      document.documentElement.classList.remove("alto-contraste");
    }
  }
  return activo;
}

export function aplicarTemaVisual(temaRaw?: string | null): TemaVisual {
  const tema: TemaVisual =
    temaRaw === "oscuro" || temaRaw === "claro" || temaRaw === "sistema"
      ? temaRaw
      : "claro";

  if (typeof document !== "undefined" && typeof window !== "undefined") {
    let esOscuro = false;
    if (tema === "oscuro") {
      esOscuro = true;
    } else if (tema === "sistema") {
      esOscuro = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
    }

    if (esOscuro) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "app-dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "app-light");
    }
  }

  return tema;
}

export function aplicarPreferenciasDispositivo(): void {
  if (typeof window === "undefined") return;
  try {
    const contraste = window.localStorage.getItem("semillas-pref-contraste");
    const tamano = window.localStorage.getItem("semillas-pref-text-size");
    const tema = window.localStorage.getItem("semillas-pref-tema") || "claro";

    aplicarContraste(contraste === "alto");
    if (tamano) {
      aplicarTamanoTexto(tamano);
    }
    aplicarTemaVisual(tema);
  } catch {
    // ignorar si localStorage está bloqueado
  }
}

export function estaActivoControlParental(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem("semillas-pref-parental") === "true";
  } catch {
    return false;
  }
}

export function obtenerPinParental(): string {
  if (typeof window === "undefined") return "1234";
  try {
    return window.localStorage.getItem("semillas-pref-parental-pin") || "1234";
  } catch {
    return "1234";
  }
}
