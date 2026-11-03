import { useCallback, useEffect, useState } from "react";
import { obtenerUrlFirmadaRecurso } from "./media.api";
import { obtenerMedioCacheado } from "@/lib/offline/media-cache";

import tema1Img from "@/assets/images/Ilustraciones/Tema1.webp";
import tema2Img from "@/assets/images/Ilustraciones/Tema2.webp";
import tema3Img from "@/assets/images/Ilustraciones/Tema3.webp";
import tema4Img from "@/assets/images/Ilustraciones/Tema4.webp";
import sendaPadreImg from "@/assets/images/Ilustraciones/Senda del Padre.webp";
import sendaHijoImg from "@/assets/images/Ilustraciones/Senda del hijo.webp";
import sendaEspirituImg from "@/assets/images/Ilustraciones/Senda del espiritu santo.webp";
import detallePadreImg from "@/assets/images/Ilustraciones/detalle_padre.webp";
import detalleHijoImg from "@/assets/images/Ilustraciones/detalle_hijo.webp";
import detalleEspirituImg from "@/assets/images/Ilustraciones/detalle_espiritu.webp";
import conectarImg from "@/assets/images/Ilustraciones/Conectar.webp";
import relatarImg from "@/assets/images/Ilustraciones/Relatar.webp";
import ensenarImg from "@/assets/images/Ilustraciones/Ensenar.webp";
import comprobarImg from "@/assets/images/Ilustraciones/Comprobar.webp";
import experimentarImg from "@/assets/images/Ilustraciones/Experimentar.webp";
import recompensaImg from "@/assets/images/Ilustraciones/Recompensa.webp";
import exploradoresImg from "@/assets/images/Ilustraciones/Exploradores.webp";
import semillaImg from "@/assets/images/Ilustraciones/Semilla.webp";
import embajadoresImg from "@/assets/images/Ilustraciones/Embajadores.webp";
import versiculoImg from "@/assets/images/Ilustraciones/Versiculo del dia.webp";
import logoOriginalImg from "@/assets/images/logos/Logo_original.webp";
import defaultTemaImg from "@/assets/images/temas/default-tema.webp";

const UUID_EXTRACT_REGEX = /([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i;

const ILUSTRACIONES_POOL = [
  tema1Img,
  tema2Img,
  tema3Img,
  tema4Img,
  sendaPadreImg,
  sendaHijoImg,
  sendaEspirituImg,
  conectarImg,
  relatarImg,
  ensenarImg,
  comprobarImg,
  experimentarImg,
  exploradoresImg,
];

export function obtenerIlustracionFallback(hint?: string | null, indexSeed = 0): string {
  const texto = (hint ?? "").toLowerCase();

  if (texto.includes("logo") || texto.includes("icono")) return logoOriginalImg;
  if (texto.includes("tema1") || texto.includes("amor de dios") || texto.includes("creacion")) return tema1Img;
  if (texto.includes("tema2") || texto.includes("parabola") || texto.includes("parábola")) return tema2Img;
  if (texto.includes("tema3") || texto.includes("fruto")) return tema3Img;
  if (texto.includes("tema4")) return tema4Img;
  if (texto.includes("detalle_padre") || texto.includes("padre")) return sendaPadreImg;
  if (texto.includes("detalle_hijo") || texto.includes("hijo") || texto.includes("jesus") || texto.includes("jesús")) return sendaHijoImg;
  if (texto.includes("detalle_espiritu") || texto.includes("espiritu") || texto.includes("espíritu")) return sendaEspirituImg;
  if (texto.includes("conectar")) return conectarImg;
  if (texto.includes("relatar")) return relatarImg;
  if (texto.includes("ensenar") || texto.includes("enseñar")) return ensenarImg;
  if (texto.includes("comprobar")) return comprobarImg;
  if (texto.includes("experimentar")) return experimentarImg;
  if (texto.includes("recompensa")) return recompensaImg;
  if (texto.includes("semilla") || texto.includes("conejito")) return semillaImg;
  if (texto.includes("explorador")) return exploradoresImg;
  if (texto.includes("embajador")) return embajadoresImg;
  if (texto.includes("versiculo") || texto.includes("versículo")) return versiculoImg;
  if (texto.includes("default")) return defaultTemaImg;

  // Deterministic choice based on string hash so different items get distinct illustrations
  if (texto.length > 0) {
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
      hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
    }
    return ILUSTRACIONES_POOL[hash % ILUSTRACIONES_POOL.length] ?? tema1Img;
  }

  return ILUSTRACIONES_POOL[Math.abs(indexSeed) % ILUSTRACIONES_POOL.length] ?? tema1Img;
}

export function extraerMediaId(resourceId?: string | null, rawUrl?: string | null): string | null {
  if (resourceId && UUID_EXTRACT_REGEX.test(resourceId)) {
    return resourceId.match(UUID_EXTRACT_REGEX)?.[1] ?? null;
  }
  if (!rawUrl) return null;
  if (rawUrl.startsWith("/media/") || rawUrl.startsWith("/__offline_media/") || rawUrl.startsWith("privada://")) {
    const match = rawUrl.match(UUID_EXTRACT_REGEX);
    return match?.[1] ?? null;
  }
  return null;
}

export function esUrlDirectaValida(url?: string | null): boolean {
  if (!url) return false;
  const limpia = url.trim();
  if (!limpia) return false;
  if (limpia.startsWith("/src/assets/")) return false;
  if (limpia.startsWith("/media/")) return false;
  if (limpia.startsWith("privada://")) return false;
  if (limpia.startsWith("/__offline_media/")) return false;
  return (
    limpia.startsWith("http://") ||
    limpia.startsWith("https://") ||
    limpia.startsWith("blob:") ||
    limpia.startsWith("data:") ||
    limpia.startsWith("/")
  );
}

interface UseResolvedMediaUrlOptions {
  resourceId?: string | null;
  rawUrl?: string | null;
  fallbackHint?: string | null;
  useFallbackOnError?: boolean;
}

export function useResolvedMediaUrl({
  resourceId,
  rawUrl,
  fallbackHint,
  useFallbackOnError = true,
}: UseResolvedMediaUrlOptions) {
  const mediaId = extraerMediaId(resourceId, rawUrl);
  const fallbackSrc = obtenerIlustracionFallback(fallbackHint || rawUrl || resourceId);

  const [resolvedUrl, setResolvedUrl] = useState<string | null>(() => {
    if (rawUrl?.startsWith("/src/assets/")) {
      return obtenerIlustracionFallback(rawUrl);
    }
    if (esUrlDirectaValida(rawUrl)) {
      return rawUrl!.trim();
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => !esUrlDirectaValida(rawUrl) && Boolean(mediaId));
  const [triedSignedRefresh, setTriedSignedRefresh] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let createdObjectUrl: string | null = null;

    setTriedSignedRefresh(false);
    setUsingFallback(false);

    if (rawUrl?.startsWith("/src/assets/")) {
      setResolvedUrl(obtenerIlustracionFallback(rawUrl));
      setIsLoading(false);
      return;
    }

    async function resolve() {
      // 1. Si hay mediaId, primero revisar cache offline de medios
      if (mediaId) {
        try {
          const cachedResponse = await obtenerMedioCacheado(mediaId);
          if (cachedResponse && !cancelled) {
            const blob = await cachedResponse.blob();
            if (blob.size > 0 && !cancelled) {
              createdObjectUrl = URL.createObjectURL(blob);
              setResolvedUrl(createdObjectUrl);
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // continuar con URL directa o firmada
        }
      }

      // 2. Si ya tenemos una URL directa válida (ej. https:// firmada), usarla inicialmente
      if (esUrlDirectaValida(rawUrl)) {
        if (!cancelled) {
          setResolvedUrl(rawUrl!.trim());
          setIsLoading(false);
        }
        return;
      }

      // 3. Si tenemos mediaId pero la URL era /media/:id/url, privada:// o vacía, pedir URL firmada
      if (mediaId && navigator.onLine) {
        setIsLoading(true);
        try {
          const firmada = await obtenerUrlFirmadaRecurso(mediaId);
          if (!cancelled && firmada?.url) {
            setTriedSignedRefresh(true);
            setResolvedUrl(firmada.url);
            setIsLoading(false);
            return;
          }
        } catch {
          // Caer al fallback
        }
      }

      // 4. Fallback visual
      if (!cancelled) {
        if (useFallbackOnError) {
          setUsingFallback(true);
          setResolvedUrl(fallbackSrc);
        } else {
          setResolvedUrl(null);
        }
        setIsLoading(false);
      }
    }

    void resolve();

    return () => {
      cancelled = true;
      if (createdObjectUrl) {
        URL.revokeObjectURL(createdObjectUrl);
      }
    };
  }, [mediaId, rawUrl, fallbackSrc, useFallbackOnError]);

  const handleImageError = useCallback(async () => {
    // Si la URL firmada expiró y aún no hemos pedido una nueva al endpoint /media/:id/url, intentarlo una vez
    if (mediaId && !triedSignedRefresh && navigator.onLine) {
      setTriedSignedRefresh(true);
      try {
        const firmada = await obtenerUrlFirmadaRecurso(mediaId);
        if (firmada?.url && firmada.url !== resolvedUrl) {
          setResolvedUrl(firmada.url);
          return;
        }
      } catch {
        // Ignorar y aplicar fallback
      }
    }

    if (useFallbackOnError && resolvedUrl !== fallbackSrc) {
      setUsingFallback(true);
      setResolvedUrl(fallbackSrc);
    }
  }, [mediaId, triedSignedRefresh, resolvedUrl, useFallbackOnError, fallbackSrc]);

  return {
    src: resolvedUrl ?? (useFallbackOnError ? fallbackSrc : null),
    isLoading,
    usingFallback,
    handleImageError,
    fallbackSrc,
  };
}

export {
  tema1Img,
  tema2Img,
  tema3Img,
  tema4Img,
  sendaPadreImg,
  sendaHijoImg,
  sendaEspirituImg,
  detallePadreImg,
  detalleHijoImg,
  detalleEspirituImg,
};
