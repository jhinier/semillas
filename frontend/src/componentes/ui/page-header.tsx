import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { unirClases } from "@/lib/utilidades";

interface RutaMigaja {
  label: string;
  href?: string;
}

export interface PropiedadesPageHeader extends React.HTMLAttributes<HTMLDivElement> {
  titulo: string;
  descripcion?: string;
  migajas?: RutaMigaja[];
  acciones?: React.ReactNode;
  children?: React.ReactNode;
  clase?: string;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PropiedadesPageHeader>(
  (
    {
      titulo,
      descripcion,
      migajas,
      acciones,
      children,
      clase,
      className,
      ...propiedades
    },
    referencia,
  ) => {
    const tieneMigajas = migajas && migajas.length > 0;

    return (
      <div
        ref={referencia}
        className={unirClases("mb-6", className, clase)}
        {...propiedades}
      >
        {tieneMigajas && (
          <nav className="mb-3 flex items-center gap-1 text-xs font-medium text-slate-400" aria-label="Migajas">
            {migajas.map((migaja, indice) => (
              <React.Fragment key={indice}>
                {indice > 0 && <ChevronRight className="h-3 w-3" />}
                {migaja.href ? (
                  <Link
                    to={migaja.href}
                    className="transition-colors hover:text-slate-600"
                  >
                    {migaja.label}
                  </Link>
                ) : (
                  <span className="text-slate-600">{migaja.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              {titulo}
            </h1>
            {descripcion && (
              <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
            )}
          </div>

          {acciones && <div className="shrink-0">{acciones}</div>}
        </div>

        {children}
      </div>
    );
  }
);
PageHeader.displayName = "PageHeader";
