import * as React from "react";
import { unirClases } from "@/lib/utilidades";

export type TablaSkeletonProps = {
  filas?: number;
  columnas?: number;
  className?: string;
};

export function TablaSkeleton({ filas = 5, columnas = 8, className }: TablaSkeletonProps) {
  return (
    <tbody className={unirClases("divide-y divide-slate-100", className)}>
      {Array.from({ length: filas }).map((_, i) => (
        <tr key={`skeleton-${i}`} className="animate-pulse">
          {Array.from({ length: columnas }).map((_, j) => (
            <td key={j} className="py-4 px-2">
              <div className="h-3 bg-slate-100 rounded w-3/4 mx-auto" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export type TablaSkeletonPersonalizadoProps = {
  filas?: number;
  className?: string;
  children: React.ReactNode;
};

export function TablaSkeletonPersonalizado({ filas = 5, className, children }: TablaSkeletonPersonalizadoProps) {
  return (
    <tbody className={unirClases("divide-y divide-slate-100", className)}>
      {Array.from({ length: filas }).map((_, i) => (
        <tr key={`skel-personalizado-${i}`} className="animate-pulse">
          {children}
        </tr>
      ))}
    </tbody>
  );
}
