import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type PropiedadesInput } from "./input";

export interface PropiedadesInputContraseña extends Omit<PropiedadesInput, "type"> {
  mostrarBotonVer?: boolean;
}

export const InputContraseña = React.forwardRef<HTMLInputElement, PropiedadesInputContraseña>(
  ({ mostrarBotonVer = true, clase, className, ...propiedades }, referencia) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="relative w-full">
        <Input
          ref={referencia}
          type={visible ? "text" : "password"}
          iconoDerecho={
            mostrarBotonVer ? (
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                className="text-gray-400 hover:text-gray-600 pointer-events-auto transition-colors"
                aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            ) : undefined
          }
          clase={clase}
          className={className}
          {...propiedades}
        />
      </div>
    );
  },
);

InputContraseña.displayName = "InputContraseña";
