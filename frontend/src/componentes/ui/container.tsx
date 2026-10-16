import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { unirClases } from "@/lib/utilidades";

const variantesContenedor = cva("w-full mx-auto", {
  variants: {
    variante: {
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-screen-xl",
      "2xl": "max-w-screen-2xl",
      fluido: "max-w-full",
    },
    padding: {
      none: "",
      xs: "px-2",
      sm: "px-4",
      md: "px-6",
      lg: "px-8",
      xl: "px-12",
    },
  },
  defaultVariants: {
    variante: "lg",
    padding: "md",
  },
});

export interface PropiedadesContenedor
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof variantesContenedor> {
  children?: React.ReactNode;
  clase?: string;
}

export const Container = React.forwardRef<HTMLDivElement, PropiedadesContenedor>(
  (
    {
      variante,
      padding,
      children,
      clase,
      className,
      ...propiedades
    },
    referencia,
  ) => (
    <div
      ref={referencia}
      className={unirClases(variantesContenedor({ variante, padding }), className, clase)}
      {...propiedades}
    >
      {children}
    </div>
  ),
);
Container.displayName = "Container";
