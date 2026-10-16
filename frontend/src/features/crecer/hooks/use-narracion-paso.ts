import { useEffect, useState } from "react";
import { obtenerUrlFirmadaRecurso } from "@/features/media/media.api";
import { obtenerMedioCacheado } from "@/lib/offline/media-cache";
import { cargarSrcNarracion, resolverSrcNarracion } from "./narracion-utils";
export { cargarSrcNarracion, resolverSrcNarracion } from "./narracion-utils";

export type EstadoNarracion = "inactiva" | "cargando" | "lista" | "error";

export function useNarracionPaso(recursoId: string | null | undefined, habilitada: boolean) {
  const [src, setSrc] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoNarracion>("inactiva");

  useEffect(() => {
    let cancelado = false;
    let objectUrl: string | null = null;

    async function cargar() {
      if (!recursoId || !habilitada) {
        setSrc(null);
        setEstado("inactiva");
        return;
      }
      setEstado("cargando");
      try {
        const resultado = await cargarSrcNarracion(recursoId, {
          obtenerCache: obtenerMedioCacheado,
          obtenerUrlFirmada: obtenerUrlFirmadaRecurso,
          online: navigator.onLine,
          crearObjectUrl: (blob) => {
            objectUrl = URL.createObjectURL(blob);
            return objectUrl;
          },
        });
        if (!cancelado) {
          setSrc(resultado.src);
          setEstado("lista");
        }
      } catch {
        if (!cancelado) {
          setSrc(null);
          setEstado("error");
        }
      }
    }

    void cargar();
    return () => {
      cancelado = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [recursoId, habilitada]);

  return { src, estado };
}
