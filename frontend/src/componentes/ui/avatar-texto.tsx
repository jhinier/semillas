import * as React from "react";

import { unirClases } from "@/lib/utilidades";

type AvatarTextoProps = {
  src: string;
  alt: string;
  titulo: React.ReactNode;
  subtitulo?: React.ReactNode;
  className?: string;
  avatarClassName?: string;
  contenidoClassName?: string;
  tituloClassName?: string;
  subtituloClassName?: string;
};

export function AvatarTexto({
  src,
  alt,
  titulo,
  subtitulo,
  className,
  avatarClassName,
  contenidoClassName,
  tituloClassName,
  subtituloClassName,
}: AvatarTextoProps) {
  return (
    <div className={unirClases("flex min-w-0 items-center gap-2.5 text-left", className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={unirClases("shrink-0 object-cover", avatarClassName)}
      />
      <div className={unirClases("flex min-w-0 flex-col", contenidoClassName)}>
        <span className={unirClases("truncate", tituloClassName)}>{titulo}</span>
        {subtitulo ? <span className={unirClases("truncate", subtituloClassName)}>{subtitulo}</span> : null}
      </div>
    </div>
  );
}
