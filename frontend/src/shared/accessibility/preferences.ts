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

export function obtenerClavePref(claveBase: string, scopeId?: string | null): string {
  if (!scopeId || scopeId === "default") {
    return claveBase;
  }
  return `${claveBase}:${scopeId}`;
}

export function leerPreferenciaPerfil(
  claveBase: string,
  scopeId?: string | null,
  fallback: string | null = null,
): string | null {
  if (typeof window === "undefined") return fallback;
  try {
    if (scopeId) {
      const valScoped = window.localStorage.getItem(obtenerClavePref(claveBase, scopeId));
      if (valScoped !== null) return valScoped;
      return fallback;
    }
    const valGlobal = window.localStorage.getItem(claveBase);
    return valGlobal !== null ? valGlobal : fallback;
  } catch {
    return fallback;
  }
}

export function guardarPreferenciaPerfil(
  claveBase: string,
  valor: string,
  scopeId?: string | null,
): void {
  if (typeof window === "undefined") return;
  try {
    if (scopeId && scopeId !== "default") {
      window.localStorage.setItem(obtenerClavePref(claveBase, scopeId), valor);
    } else {
      window.localStorage.setItem(claveBase, valor);
    }
  } catch {
    // ignorar si localStorage está bloqueado
  }
}

export function limpiarPreferenciasSesion(): void {
  if (typeof document !== "undefined") {
    document.documentElement.classList.remove("dark", "alto-contraste");
    document.documentElement.setAttribute("data-theme", "app-light");
    document.documentElement.dataset.semillasTextSize = "mediano";
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem("semillas-pref-tema");
      window.localStorage.removeItem("semillas-pref-contraste");
      window.localStorage.removeItem("semillas-pref-text-size");
    } catch {
      // ignorar si localStorage está bloqueado
    }
  }
}

export function aplicarPreferenciasDispositivo(scopeId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const contraste = leerPreferenciaPerfil("semillas-pref-contraste", scopeId);
    const tamano = leerPreferenciaPerfil("semillas-pref-text-size", scopeId);
    const tema = leerPreferenciaPerfil("semillas-pref-tema", scopeId, "claro") || "claro";

    aplicarContraste(contraste === "alto");
    if (tamano) {
      aplicarTamanoTexto(tamano);
    }
    aplicarTemaVisual(tema);
  } catch {
    // ignorar si localStorage está bloqueado
  }
}

export function estaActivoControlParental(scopeId?: string | null): boolean {
  if (typeof window === "undefined") return false;
  try {
    return leerPreferenciaPerfil("semillas-pref-parental", scopeId) === "true";
  } catch {
    return false;
  }
}

export function obtenerPinParental(scopeId?: string | null): string {
  if (typeof window === "undefined") return "1234";
  try {
    return leerPreferenciaPerfil("semillas-pref-parental-pin", scopeId, "1234") || "1234";
  } catch {
    return "1234";
  }
}
