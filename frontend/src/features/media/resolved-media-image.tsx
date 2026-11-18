import { useEffect, useRef, useState, type ImgHTMLAttributes, type ReactNode } from "react";
import { esUrlDirectaValida, useResolvedMediaUrl } from "./use-resolved-media-url";

export type ResolvedMediaImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  resourceId?: string | null;
  rawUrl?: string | null;
  fallbackSrc?: string;
  fallbackHint?: string | null;
  useIlustracionFallback?: boolean;
  onImageErrorChange?: (hasError: boolean) => void;
  renderFallback?: (estado: { isLoading: boolean; hasError: boolean }) => ReactNode;
};

/** Renderiza una imagen resolviendo recursos privados /media/:id/url y manejando fallbacks ante error de carga. */
export function ResolvedMediaImage({
  resourceId,
  rawUrl,
  fallbackSrc,
  fallbackHint,
  useIlustracionFallback = false,
  onImageErrorChange,
  renderFallback,
  alt = "",
  onError,
  ...imgProps
}: ResolvedMediaImageProps) {
  const resolved = useResolvedMediaUrl({
    resourceId,
    rawUrl,
    fallbackHint,
    useFallbackOnError: useIlustracionFallback,
  });

  const [fallbackActivo, setFallbackActivo] = useState(false);
  const [falloTotal, setFalloTotal] = useState(false);
  const onErrorChangeRef = useRef(onImageErrorChange);
  onErrorChangeRef.current = onImageErrorChange;

  useEffect(() => {
    setFallbackActivo(false);
    setFalloTotal(false);
    onErrorChangeRef.current?.(false);
  }, [rawUrl, resourceId, resolved.src]);

  const urlSeguraDirecta = esUrlDirectaValida(rawUrl) ? rawUrl!.trim() : null;
  const candidataPrincipal =
    resolved.src || urlSeguraDirecta || (useIlustracionFallback ? resolved.fallbackSrc : null);
  const srcActual = fallbackActivo
    ? (fallbackSrc || (useIlustracionFallback ? resolved.fallbackSrc : null))
    : (candidataPrincipal || fallbackSrc || null);

  if (falloTotal || !srcActual) {
    return renderFallback ? <>{renderFallback({ isLoading: resolved.isLoading, hasError: falloTotal })}</> : null;
  }

  return (
    <img
      {...imgProps}
      src={srcActual}
      alt={alt}
      onError={(evento) => {
        onError?.(evento);
        void resolved.handleImageError();
        const respaldo = fallbackSrc || (useIlustracionFallback ? resolved.fallbackSrc : null);
        if (!fallbackActivo && respaldo && respaldo !== srcActual) {
          setFallbackActivo(true);
          onErrorChangeRef.current?.(true);
          return;
        }
        setFalloTotal(true);
        onErrorChangeRef.current?.(true);
      }}
    />
  );
}
