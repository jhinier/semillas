import { useMemo } from "react";

type InfoNivel = {
  xpTotal: number;
  numNivel: number;
  nombreNivel: string;
  xpEnNivel: number;
  xpRestantes: number;
  porcentaje: number;
};

export function useNivelInfo(
  nivel?: { xp_total?: number; numero_nivel?: number; nombre_nivel?: string } | null,
): InfoNivel {
  return useMemo(() => {
    const xpTotal = nivel?.xp_total ?? 1250;
    const numNivel = nivel?.numero_nivel ?? 7;
    const xpEnNivel = xpTotal % 1000;
    const xpRestantes = 1000 - xpEnNivel;
    const porcentaje = Math.round((xpEnNivel / 1000) * 100);

    return {
      xpTotal,
      numNivel,
      nombreNivel: nivel?.nombre_nivel || "Explorador",
      xpEnNivel,
      xpRestantes,
      porcentaje,
    };
  }, [nivel]);
}
