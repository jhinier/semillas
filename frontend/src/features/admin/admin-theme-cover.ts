import { useQueries } from "@tanstack/react-query";
import { obtenerUrlFirmadaRecurso } from "../media/media.api";

export const INTERVALO_RENOVACION_PORTADA_ADMIN_MS = 4 * 60 * 1000;

type PortadaTemaAdmin = {
  titulo: string;
  urlFirmada: string | null;
  urlPublica?: string | null;
};

export type TemaConPortadaAdmin = {
  id: string;
  portada_recurso_id: string | null;
  portada_recurso?: { id: string } | null;
};

export function obtenerIdPortadaTemaAdmin(tema: TemaConPortadaAdmin) {
  return tema.portada_recurso_id ?? tema.portada_recurso?.id ?? null;
}

export function resolverPortadaTemaAdmin({ titulo, urlFirmada }: PortadaTemaAdmin) {
  return urlFirmada ?? `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(titulo)}`;
}

export function crearConsultaPortadaFirmadaAdmin(
  tema: TemaConPortadaAdmin,
  obtenerUrlFirmada = obtenerUrlFirmadaRecurso,
) {
  const recursoId = obtenerIdPortadaTemaAdmin(tema);

  return {
    queryKey: ["admin", "recurso-url", recursoId],
    queryFn: () => obtenerUrlFirmada(recursoId!),
    enabled: recursoId !== null,
    staleTime: 3 * 60 * 1000,
    gcTime: 4 * 60 * 1000,
    refetchInterval: INTERVALO_RENOVACION_PORTADA_ADMIN_MS,
    retry: 1,
  };
}

export function usePortadasFirmadasAdmin(temas: TemaConPortadaAdmin[]) {
  return useQueries({
    queries: temas.map((tema) => crearConsultaPortadaFirmadaAdmin(tema)),
    combine: (resultados) => {
      const portadas = new Map<string, string | null>();

      temas.forEach((tema, indice) => {
        portadas.set(tema.id, resultados[indice]?.data?.url ?? null);
      });

      return portadas;
    },
  });
}
