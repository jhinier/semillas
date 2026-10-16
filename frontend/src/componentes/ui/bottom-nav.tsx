import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export interface OpcionBottomNav {
  id: string;
  etiqueta: string;
  icono: React.ReactNode;
  /** Si true, muestra un punto rojo de notificación sobre el ícono */
  badge?: boolean;
}

export interface PropiedadesBottomNav {
  opciones: OpcionBottomNav[];
  activo: string;
  onCambiar: (id: string) => void;
  clase?: string;
}

export const BottomNav: React.FC<PropiedadesBottomNav> = ({
  opciones,
  activo,
  onCambiar,
  clase,
}) => {
  return (
    <div className={unirClases("bottom-nav", clase)}>
      {opciones.map((op) => {
        const esActivo = op.id === activo;
        const esPrincipal = op.id === "jugar";

        return (
          <button
            key={op.id}
            type="button"
            onClick={() => onCambiar(op.id)}
            className={unirClases(
              "bottom-nav__item",
              esActivo && "bottom-nav__item--active",
              esPrincipal && "bottom-nav__item--primary",
            )}
            aria-current={esActivo ? "page" : undefined}
          >
            <span
              className={unirClases(
                "bottom-nav__icon",
                esActivo ? "text-[#6C3AED]" : "text-slate-400",
                "relative",
              )}
            >
              {op.icono}
              {op.badge && (
                <span
                  className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"
                  aria-label="Tienes logros por reclamar"
                />
              )}
            </span>
            <span
              className={unirClases(
                "bottom-nav__label",
                esActivo ? "text-[#6C3AED]" : "text-slate-400",
              )}
            >
              {op.etiqueta}
            </span>
          </button>
        );
      })}
    </div>
  );
};
