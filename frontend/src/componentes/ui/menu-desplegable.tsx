// frontend/src/componentes/ui/menu-desplegable.tsx
import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export type ItemMenu = {
  label: string;
  icono?: string;
  iconoColor?: string;
  textoColor?: string;
  onClick: () => void;
};

export interface PropiedadesMenuDesplegable {
  items: ItemMenu[];
  estaAbierto: boolean;
  onAlternar: () => void;
  onCerrar: () => void;
  clase?: string;
}

export function MenuDesplegable({
  items,
  estaAbierto,
  onAlternar,
  onCerrar,
  clase,
}: PropiedadesMenuDesplegable) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onAlternar}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
        aria-label="Más opciones"
      >
        <i className="fa-solid fa-ellipsis-vertical text-xs" />
      </button>

      {estaAbierto && (
        <>
          <div className="fixed inset-0 z-10" onClick={onCerrar} />
          <div className={unirClases(
            "absolute right-0 z-20 mt-1.5 w-40 rounded-xl border border-slate-100 bg-white py-1.5 text-left shadow-lg",
            clase,
          )}>
            {items.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  item.onClick();
                  onCerrar();
                }}
                className={unirClases(
                  "flex w-full items-center gap-2 px-4 py-2 text-xs font-semibold transition-colors hover:bg-slate-50",
                  item.textoColor ?? "text-neutro-oscuro-max",
                )}
              >
                {item.icono && (
                  <i className={unirClases("fa-solid w-4 text-center", item.icono, item.iconoColor ?? "text-slate-400")} />
                )}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
