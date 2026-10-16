import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, Check, Info, WifiOff, X } from "lucide-react";
import { unirClases } from "@/lib/utilidades";

// ── Mapeo de Colores de Alerta (Garantiza renderizado sin depender de compilación de clases arbitrarias) ──

const MAPEO_COLORES_ALERTA = {
  exito: {
    bg: "#F0FDF4",
    border: "#2E9E5B",
    text: "#1E6B3C",
    iconColor: "#2E9E5B"
  },
  atencion: {
    bg: "#FFFDF5",
    border: "#F4B740",
    text: "#9A6B1A",
    iconColor: "#F4B740"
  },
  error: {
    bg: "#FFF5F5",
    border: "#EF4444",
    text: "#991B1B",
    iconColor: "#EF4444"
  },
  informacion: {
    bg: "#EFF6FF",
    border: "#3D8BD4",
    text: "#1E4D82",
    iconColor: "#3D8BD4"
  },
  offline: {
    bg: "#FAF5FF",
    border: "#6C3AED",
    text: "#4C1D95",
    iconColor: "#6C3AED"
  },
};

export type VarianteAlerta = keyof typeof MAPEO_COLORES_ALERTA;

const variantesAlerta = cva(
  [
    "relative w-full flex items-center justify-between gap-2.5 rounded-xl border p-3 text-xs font-bold transition-all duration-200",
  ]
);

export interface PropiedadesAlerta
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof variantesAlerta> {
  variante?: VarianteAlerta;
  onCerrar?: () => void;
  clase?: string;
}

export const Alerta = React.forwardRef<HTMLDivElement, PropiedadesAlerta>(
  ({ variante = "informacion", onCerrar, clase, className, children, style, ...propiedades }, referencia) => {
    const [visible, setVisible] = React.useState(true);

    if (!visible) return null;

    const manejarCerrar = () => {
      setVisible(false);
      onCerrar?.();
    };

    const config = MAPEO_COLORES_ALERTA[variante] || MAPEO_COLORES_ALERTA.informacion;

    const IconoPorDefecto = {
      exito: (
        <span className="flex items-center justify-center rounded-full size-6 text-white flex-shrink-0" style={{ backgroundColor: config.iconColor }}>
          <Check size={13} strokeWidth={3.5} />
        </span>
      ),
      atencion: (
        <span className="flex items-center justify-center rounded-full size-6 text-white flex-shrink-0" style={{ backgroundColor: config.iconColor }}>
          <AlertTriangle size={12} strokeWidth={3.5} />
        </span>
      ),
      error: (
        <span className="flex items-center justify-center rounded-full size-6 text-white flex-shrink-0" style={{ backgroundColor: config.iconColor }}>
          <X size={13} strokeWidth={3.5} />
        </span>
      ),
      informacion: (
        <span className="flex items-center justify-center rounded-full size-6 text-white flex-shrink-0" style={{ backgroundColor: config.iconColor }}>
          <Info size={13} strokeWidth={3.5} />
        </span>
      ),
      offline: (
        <span className="flex items-center justify-center rounded-full size-6 text-white flex-shrink-0" style={{ backgroundColor: config.iconColor }}>
          <WifiOff size={12} strokeWidth={3.5} />
        </span>
      ),
    };

    return (
      <div
        ref={referencia}
        className={unirClases(variantesAlerta(), className, clase)}
        style={{
          backgroundColor: config.bg,
          borderColor: config.border,
          color: config.text,
          ...style
        }}
        role="alert"
        {...propiedades}
      >
        <div className="flex items-center gap-2.5">
          {IconoPorDefecto[variante]}
          <span className="leading-tight">{children}</span>
        </div>
        <button
          type="button"
          onClick={manejarCerrar}
          className="text-current opacity-60 hover:opacity-100 transition-opacity p-0.5"
          aria-label="Cerrar alerta"
        >
          <X className="size-4 stroke-[2.5]" />
        </button>
      </div>
    );
  }
);

Alerta.displayName = "Alerta";
