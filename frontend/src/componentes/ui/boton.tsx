import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { unirClases } from "@/lib/utilidades";
import { ContenidoBoton } from "./boton-iconos";
import {
  variantesBoton,
  clasesEstadoVisual,
  type VarianteBoton,
  type TamanoBoton,
  type FormaBoton,
  type EstadoVisualBoton,
  type VariantPropsBoton,
} from "./boton-variants";

export type { VarianteBoton, TamanoBoton, FormaBoton, EstadoVisualBoton, VariantPropsBoton };

export interface PropiedadesBoton
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    Omit<VariantPropsBoton, "variante" | "tamano" | "forma"> {
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  forma?: FormaBoton;
  iconoIzquierdo?: React.ReactNode;
  iconoDerecho?: React.ReactNode;
  cargando?: boolean;
  textoCargando?: string;
  deshabilitado?: boolean;
  disabled?: boolean;
  estadoVisual?: EstadoVisualBoton;
  clase?: string;
  asChild?: boolean;
}

export const Boton = React.forwardRef<HTMLButtonElement, PropiedadesBoton>(
  (
    {
      variante = "primario",
      tamano = "mediano",
      forma = "normal",
      anchoCompleto = false,
      iconoIzquierdo,
      iconoDerecho,
      cargando = false,
      textoCargando,
      deshabilitado = false,
      disabled = false,
      estadoVisual = "normal",
      clase,
      className,
      children,
      type = "button",
      asChild = false,
      ...propiedades
    },
    referencia,
  ) => {
    const estaDeshabilitado = disabled || deshabilitado || cargando;

    const claseEstadoVisual =
      estadoVisual === "normal" ? "" : clasesEstadoVisual[variante]?.[estadoVisual];

    const classes = unirClases(
      variantesBoton({ variante, tamano, forma, anchoCompleto }),
      claseEstadoVisual,
      className,
      clase,
    );

    if (asChild) {
      return (
        <Slot
          ref={referencia}
          className={classes}
          {...propiedades}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={referencia}
        type={type}
        disabled={estaDeshabilitado}
        aria-busy={cargando || undefined}
        className={classes}
        {...propiedades}
      >
        <ContenidoBoton
          cargando={cargando}
          iconoIzquierdo={iconoIzquierdo}
          iconoDerecho={iconoDerecho}
          textoCargando={textoCargando}
        >
          {children}
        </ContenidoBoton>
      </button>
    );
  },
);

Boton.displayName = "Boton";
