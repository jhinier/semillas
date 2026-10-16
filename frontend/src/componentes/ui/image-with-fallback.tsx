import { useState, useCallback } from "react";

const COLORES_TIPO = {
  imagen: "from-green-600/20 to-green-600/5 text-green-600",
  audio: "from-violet-600/20 to-violet-600/5 text-violet-600",
  video: "from-red-500/20 to-red-500/5 text-red-500",
  documento: "from-teal-600/20 to-teal-600/5 text-teal-600",
} as const;

const ICONOS_TIPO = {
  imagen: "fa-regular fa-image",
  audio: "fa-solid fa-volume-high",
  video: "fa-solid fa-circle-play",
  documento: "fa-solid fa-file-pdf",
} as const;

type TipoMedia = keyof typeof COLORES_TIPO;

type Props = {
  src: string;
  alt: string;
  tipo?: TipoMedia;
  className?: string;
};

export function ImageWithFallback({ src, alt, tipo = "imagen", className = "" }: Props) {
  const [fallo, setFallo] = useState(false);

  const manejarError = useCallback(() => setFallo(true), []);

  if (fallo) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${COLORES_TIPO[tipo]} ${className}`}
      >
        <i className={`${ICONOS_TIPO[tipo]} text-3xl opacity-40`} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      onError={manejarError}
    />
  );
}
