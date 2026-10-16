import * as React from "react";
import { X } from "lucide-react";
import { unirClases } from "@/lib/utilidades";

export interface PropiedadesCloseButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onCerrar?: () => void;
  label?: string;
  tamaño?: "pequeno" | "mediano";
  clase?: string;
}

export const CloseButton = React.forwardRef<HTMLButtonElement, PropiedadesCloseButton>(
  (
    {
      onCerrar,
      label = "Cerrar",
      tamaño = "mediano",
      onClick,
      clase,
      className,
      ...propiedades
    },
    referencia,
  ) => {
    const handleOnClick = (evento: React.MouseEvent<HTMLButtonElement>) => {
      onCerrar?.();
      onClick?.(evento);
    };

    const tamañoIcono = tamaño === "pequeno" ? 14 : 18;

    return (
      <button
        ref={referencia}
        type="button"
        aria-label={label}
        onClick={handleOnClick}
        className={unirClases(
          "inline-flex items-center justify-center rounded-full text-slate-400 transition-colors",
          "hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
          tamaño === "pequeno" ? "h-6 w-6" : "h-8 w-8",
          clase,
          className,
        )}
        {...propiedades}
      >
        <X size={tamañoIcono} />
      </button>
    );
  },
);
CloseButton.displayName = "CloseButton";
