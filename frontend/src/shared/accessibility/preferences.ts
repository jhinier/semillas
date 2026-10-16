export const TAMANOS_TEXTO = ["pequeno", "mediano", "grande"] as const;

export type TamanoTexto = (typeof TAMANOS_TEXTO)[number];

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
