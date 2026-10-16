import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export type InfoNivelXPProps = {
  nivelText: string;
  xpText?: string;
  isVinculado?: boolean;
  className?: string;
};

export function InfoNivelXP({ nivelText, xpText, isVinculado = false, className }: InfoNivelXPProps) {
  if (isVinculado) {
    return (
      <div className={unirClases("flex items-center gap-1.5", className)}>
        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <i className="fa-solid fa-link text-[8px]" />
        </div>
        <span className="font-bold text-blue-600 text-xs sm:text-sm">{nivelText}</span>
      </div>
    );
  }

  return (
    <div className={unirClases("flex items-center gap-1", className)}>
      <i className="fa-solid fa-star text-amber-400 text-xs shrink-0" />
      <span className="font-bold text-slate-700 text-xs sm:text-sm">{nivelText}</span>
      {xpText && (
        <span className="text-slate-400 text-xs font-semibold ml-1">({xpText})</span>
      )}
    </div>
  );
}
