// frontend/src/componentes/ui/avatar-circular.tsx
import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export interface PropiedadesAvatarCircular {
  src: string;
  alt: string;
  tamano?: "xs" | "sm" | "md" | "lg";
  clase?: string;
}

const TAMANOS = {
  xs: "h-8 w-8",
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

export function AvatarCircular({ src, alt, tamano = "md", clase }: PropiedadesAvatarCircular) {
  return (
    <div className={unirClases(
      "flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-sm",
      TAMANOS[tamano],
      clase,
    )}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
}
