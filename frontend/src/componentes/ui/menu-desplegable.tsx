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
    <div className={unirClases("relative inline-block text-left", estaAbierto ? "z-50" : "")}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAlternar();
        }}
        aria-expanded={estaAbierto}
        aria-haspopup="menu"
        className={unirClases(
          "flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer",
          estaAbierto ? "bg-slate-100 text-slate-700" : "",
        )}
        aria-label="Más opciones"
      >
        <i className="fa-solid fa-ellipsis-vertical text-xs" />
      </button>

      {estaAbierto && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              onCerrar();
            }}
          />
          <div
            role="menu"
            className={unirClases(
              "absolute right-0 top-full z-50 mt-1.5 min-w-[190px] w-max rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl flex flex-col gap-0.5",
              clase,
            )}
          >
            {items.map((item, idx) => (
              <button
                key={idx}
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  item.onClick();
                  onCerrar();
                }}
                className={unirClases(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold whitespace-nowrap transition-colors hover:bg-slate-50",
                  item.textoColor ?? "text-slate-700",
                )}
              >
                {item.icono && (
                  <i
                    className={unirClases(
                      "fa-solid w-4 shrink-0 text-center",
                      item.icono,
                      item.iconoColor ?? "text-slate-400",
                    )}
                  />
                )}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
