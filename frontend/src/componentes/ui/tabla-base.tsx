import * as React from "react";

import { unirClases } from "@/lib/utilidades";

export type EncabezadoTabla = {
  contenido: React.ReactNode;
  className?: string;
};

export type TablaBaseProps = {
  encabezados: EncabezadoTabla[];
  children: React.ReactNode;
  className?: string;
  contenedorClassName?: string;
  tablaClassName?: string;
  cuerpoClassName?: string;
  encabezadoFilaClassName?: string;
  estadoVacio?: React.ReactNode;
  estadoVacioClassName?: string;
  colSpanVacio?: number;
};

export type FilaTablaProps = Omit<React.ComponentPropsWithoutRef<"tr">, "onClick"> & {
  onActivate?: () => void;
};

export function TablaBase({
  encabezados,
  children,
  className,
  contenedorClassName,
  tablaClassName,
  cuerpoClassName,
  encabezadoFilaClassName,
  estadoVacio,
  estadoVacioClassName,
  colSpanVacio,
}: TablaBaseProps) {
  const filas = React.Children.toArray(children);
  const mostrarEstadoVacio = filas.length === 0;

  return (
    <div className={unirClases("w-full", className)}>
      <div className={unirClases("w-full overflow-auto", contenedorClassName)}>
        <table className={unirClases("w-full border-collapse text-left text-sm", tablaClassName)}>
          <thead>
            <tr
              className={unirClases(
                "sticky top-0 z-10 border-b border-slate-100 bg-white text-left text-xs font-bold uppercase tracking-wider text-neutro",
                encabezadoFilaClassName,
              )}
            >
              {encabezados.map((encabezado, indice) => (
                <th key={indice} scope="col" className={unirClases("px-4 py-4", encabezado.className)}>
                  {encabezado.contenido}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={unirClases("divide-y divide-slate-100", cuerpoClassName)}>
            {mostrarEstadoVacio ? (
              <tr>
                <td
                  colSpan={colSpanVacio ?? encabezados.length}
                  className={unirClases("px-4 py-10 text-center text-sm text-slate-400", estadoVacioClassName)}
                >
                  {estadoVacio ?? "No hay elementos para mostrar."}
                </td>
              </tr>
            ) : (
              filas
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FilaTabla({ children, className, onActivate, onKeyDown, tabIndex, ...props }: FilaTablaProps) {
  const esInteractiva = Boolean(onActivate);

  const esControlInteractivo = (objetivo: EventTarget | null) => {
    const elemento = objetivo as unknown as { closest?: (selector: string) => Element | null } | null;

    if (!elemento || typeof elemento.closest !== "function") return false;

    return Boolean(
      elemento.closest(
        "button, a, input, select, textarea, label, [role='button']",
      ),
    );
  };

  const manejarKeyDown: React.KeyboardEventHandler<HTMLTableRowElement> = (evento) => {
    if (esControlInteractivo(evento.target)) {
      onKeyDown?.(evento);
      return;
    }

    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      onActivate?.();
    }

    onKeyDown?.(evento);
  };

  return (
    <tr
      {...props}
      onClick={
        onActivate
          ? (evento) => {
              if (esControlInteractivo(evento.target)) return;
              onActivate();
            }
          : undefined
      }
      onKeyDown={esInteractiva ? manejarKeyDown : onKeyDown}
      tabIndex={esInteractiva ? (tabIndex ?? 0) : tabIndex}
      role={esInteractiva ? "button" : props.role}
      aria-label={esInteractiva ? (props["aria-label"] ?? "Fila interactiva") : props["aria-label"]}
      className={unirClases("transition-colors", esInteractiva && "cursor-pointer hover:bg-slate-50/50", className)}
    >
      {children}
    </tr>
  );
}
