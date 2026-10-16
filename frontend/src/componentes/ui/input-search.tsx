import * as React from "react";
import { Input, type PropiedadesInput } from "./input";

export interface PropiedadesInputBusqueda extends Omit<PropiedadesInput, "iconoIzquierdo"> {
  iconoBusqueda?: React.ReactNode;
}

export const InputBusqueda = React.forwardRef<HTMLInputElement, PropiedadesInputBusqueda>(
  ({ iconoBusqueda, ...propiedades }, referencia) => {
    return (
      <Input
        ref={referencia}
        type="search"
        iconoIzquierdo={
          iconoBusqueda ?? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          )
        }
        {...propiedades}
      />
    );
  },
);

InputBusqueda.displayName = "InputBusqueda";
