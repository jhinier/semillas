import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export type PaginacionProps = {
  total: number;
  paginaActual: number;
  porPagina: number;
  onCambiarPagina: (pagina: number) => void;
  onCambiarPorPagina?: (n: number) => void;
  opcionesPorPagina?: number[];
  className?: string;
};

function generarPaginas(paginaActual: number, totalPaginas: number): (number | "ellipsis")[] {
  if (totalPaginas <= 7) {
    return Array.from({ length: totalPaginas }, (_, i) => i + 1);
  }

  const paginas: (number | "ellipsis")[] = [];
  paginas.push(1);

  if (paginaActual > 3) {
    paginas.push("ellipsis");
  }

  const start = Math.max(2, paginaActual - 1);
  const end = Math.min(totalPaginas - 1, paginaActual + 1);

  for (let i = start; i <= end; i++) {
    paginas.push(i);
  }

  if (paginaActual < totalPaginas - 2) {
    paginas.push("ellipsis");
  }

  paginas.push(totalPaginas);
  return paginas;
}

export function Paginacion({
  total,
  paginaActual,
  porPagina,
  onCambiarPagina,
  onCambiarPorPagina,
  opcionesPorPagina = [10, 20, 50],
  className,
}: PaginacionProps) {
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const inicio = total === 0 ? 0 : (paginaActual - 1) * porPagina + 1;
  const fin = Math.min(paginaActual * porPagina, total);
  const paginas = generarPaginas(paginaActual, totalPaginas);

  return (
    <div
      className={unirClases(
        "flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500 select-none",
        className,
      )}
    >
      <span>
        Mostrando {inicio} a {fin} de {total} elementos
      </span>

      <div className="flex items-center gap-1">
        <button
          disabled={paginaActual <= 1}
          onClick={() => onCambiarPagina(paginaActual - 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-default"
        >
          <i className="fa-solid fa-chevron-left text-[10px]" />
        </button>

        {paginas.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onCambiarPagina(p)}
              className={unirClases(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors font-bold cursor-pointer",
                p === paginaActual
                  ? "bg-green-600 text-white"
                  : "border border-slate-200 bg-white hover:bg-slate-50",
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          disabled={paginaActual >= totalPaginas}
          onClick={() => onCambiarPagina(paginaActual + 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-default"
        >
          <i className="fa-solid fa-chevron-right text-[10px]" />
        </button>
      </div>

      {onCambiarPorPagina && (
        <select
          value={porPagina}
          onChange={(e) => onCambiarPorPagina(Number(e.target.value))}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-600 focus:outline-none cursor-pointer"
        >
          {opcionesPorPagina.map((n) => (
            <option key={n} value={n}>
              {n} por página
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
