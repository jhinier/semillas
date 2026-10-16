import * as React from "react";
import { Loader2 } from "lucide-react";

export interface PropiedadesLoaderIcon {
  className?: string;
}

export const LoaderIcon: React.FC<PropiedadesLoaderIcon> = ({ className }) => (
  <Loader2 className={className} aria-hidden="true" />
);

export interface PropiedadesIconSlot {
  icono: React.ReactNode;
  className?: string;
}

export const IconSlot: React.FC<PropiedadesIconSlot> = ({ icono, className }) => (
  <span className={className}>{icono}</span>
);

export interface PropiedadesContenidoBoton {
  cargando: boolean;
  iconoIzquierdo?: React.ReactNode;
  iconoDerecho?: React.ReactNode;
  textoCargando?: string;
  children?: React.ReactNode;
}

export const ContenidoBoton: React.FC<PropiedadesContenidoBoton> = ({
  cargando,
  iconoIzquierdo,
  iconoDerecho,
  textoCargando,
  children,
}) => (
  <>
    {cargando ? (
      <LoaderIcon className="size-4 animate-spin" />
    ) : (
      iconoIzquierdo && <IconSlot icono={iconoIzquierdo} className="inline-flex shrink-0" />
    )}

    {children && (
      <span>{cargando && textoCargando ? textoCargando : children}</span>
    )}

    {!cargando && iconoDerecho && (
      <IconSlot icono={iconoDerecho} className="inline-flex shrink-0" />
    )}
  </>
);
